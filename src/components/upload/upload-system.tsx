"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useDropzone } from "react-dropzone";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "motion/react";
import {
  UploadCloud,
  Camera,
  FileText,
  X,
  CheckCircle2,
  AlertCircle,
  Loader2,
  AlertTriangle,
} from "lucide-react";

import { useAuth } from "@/hooks/use-auth";
import { generateFileHash } from "@/lib/utils/hash";
import { uploadSchema, type UploadFormData } from "@/lib/validations";
import { RESOURCE_TYPES, EXAM_TYPES } from "@/lib/constants";

type UploadStep = "selection" | "file_preview" | "ai_processing" | "form" | "success";
type UploadMode = "document" | "capture";

const MAX_FILE_SIZE = 25 * 1024 * 1024;

export function UploadSystem() {
  const router = useRouter();
  const { profile } = useAuth();
  const queryClient = useQueryClient();

  const [step, setStep] = useState<UploadStep>("selection");
  const [mode, setMode] = useState<UploadMode | null>(null);
  const [file, setFile] = useState<File | null>(null);
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [duplicateWarning, setDuplicateWarning] = useState<string | null>(null);
  const [similarWarning, setSimilarWarning] = useState<string | null>(null);
  const [ignoreSimilar, setIgnoreSimilar] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<UploadFormData>({
    resolver: zodResolver(uploadSchema),
  });

  const checkHashCollision = async (hash: string): Promise<boolean> => {
    try {
      const res = await fetch("/api/upload/check-hash", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hash }),
      });
      const data = await res.json();
      if (data.isDuplicate) {
        setDuplicateWarning(data.message);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  const processFileForAI = async (selectedFile: File) => {
    const isImageOrPdf = selectedFile.type.startsWith("image/") || selectedFile.type === "application/pdf";
    
    if (isImageOrPdf) {
      setStep("ai_processing");
      await extractDataWithGemini(selectedFile);
    } else {
      setStep("form");
    }
  };

  const extractDataWithGemini = async (documentFile: File) => {
    setIsProcessing(true);
    try {
      const reader = new FileReader();
      const base64Promise = new Promise<string>((resolve, reject) => {
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
      });
      reader.readAsDataURL(documentFile);
      const base64Data = await base64Promise;

      let result = null;
      let lastError = null;

      for (let attempt = 1; attempt <= 2; attempt++) {
        try {
          const response = await fetch("/api/ai/extract", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              fileBase64: base64Data,
              mimeType: documentFile.type,
            }),
          });

          if (!response.ok) throw new Error(`AI Extraction failed on attempt ${attempt}`);

          result = await response.json();
          break;
        } catch (err) {
          lastError = err;
          console.warn(`Extraction attempt ${attempt} failed.`);
          if (attempt === 1) await new Promise(res => setTimeout(res, 1000));
        }
      }

      if (!result || !result.success) throw lastError;

      const data = result.data;

      if (data.title) setValue("title", data.title);
      if (data.description) setValue("description", data.description);
      if (data.university) setValue("university", data.university);
      if (data.course) setValue("course", data.course);
      if (data.semester) setValue("semester", Number(data.semester));
      if (data.subject) setValue("subject", data.subject);
      if (data.year) setValue("year", Number(data.year));
      
      if (data.examType) {
        const matchedType = EXAM_TYPES.find(
          t => t.toLowerCase().replace(/[^a-z]/g, "") === data.examType.toLowerCase().replace(/[^a-z]/g, "")
        );
        if (matchedType) setValue("examType", matchedType);
      }

      if (data.tags) setValue("tags", data.tags);
      setValue("type", "PYQ");

    } catch (err) {
      console.error(err);
      setError("AI extraction failed. You can fill the details manually.");
    } finally {
      setIsProcessing(false);
      setStep("form");
    }
  };

  const onSubmit = async (data: UploadFormData) => {
    if (!file || !profile) return;

    try {
      setError(null);
      setSimilarWarning(null);

      const formData = new FormData();
      formData.append("file", file);
      formData.append("ignoreSimilar", ignoreSimilar.toString());
      
      formData.append("title", data.title);
      formData.append("description", data.description);
      formData.append("type", data.type);
      formData.append("university", data.university);
      formData.append("course", data.course);
      formData.append("semester", data.semester.toString());
      formData.append("subject", data.subject);
      formData.append("year", data.year.toString());
      if (data.examType) formData.append("examType", data.examType);
      if (data.tags) formData.append("tags", data.tags);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        
        if (response.status === 409 && errData.error === "SIMILAR_DUPLICATE") {
          setSimilarWarning(errData.message);
          return;
        }
        
        const detailMsg = Array.isArray(errData.details) && errData.details.length > 0
          ? `${errData.details[0].path?.join(".") || "Field"}: ${errData.details[0].message}`
          : null;
        const errorMsg = errData.message || detailMsg || errData.error || "Upload failed";
        throw new Error(errorMsg);
      }

      queryClient.invalidateQueries({ queryKey: ["userStats"] });
      setStep("success");
    } catch (err: any) {
      console.error("Upload failed:", err);
      setError(err.message || "Failed to upload file. Please try again.");
    }
  };

  const handleFileDrop = async (selectedFile: File, selectedMode: UploadMode) => {
    if (selectedFile.size > MAX_FILE_SIZE) {
      setError("File is too large. Maximum size is 25MB.");
      return;
    }

    setFile(selectedFile);
    setMode(selectedMode);
    setStep("file_preview");
    setError(null);
    setDuplicateWarning(null);
    setSimilarWarning(null);
    setIgnoreSimilar(false);

    try {
      const hash = await generateFileHash(selectedFile);
      const isDuplicate = await checkHashCollision(hash);
      
      if (selectedMode === "capture") {
        if (!isDuplicate) {
          await processFileForAI(selectedFile);
        }
      }
    } catch (err) {
      console.error("Hashing failed:", err);
    }
  };

  const { getRootProps: getDocRootProps, getInputProps: getDocInputProps, isDragActive: isDocDragActive } = useDropzone({
    onDrop: (files) => files[0] && handleFileDrop(files[0], "document"),
    accept: {
      "application/pdf": [".pdf"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
      "application/vnd.openxmlformats-officedocument.presentationml.presentation": [".pptx"],
      "image/jpeg": [".jpg", ".jpeg"],
      "image/png": [".png"],
    },
    maxFiles: 1,
  });

  const { getRootProps: getCaptureRootProps, getInputProps: getCaptureInputProps, isDragActive: isCaptureDragActive } = useDropzone({
    onDrop: (files) => files[0] && handleFileDrop(files[0], "capture"),
    accept: {
      "image/*": [".jpg", ".jpeg", ".png", ".webp"],
    },
    maxFiles: 1,
  });

  const cancelUpload = () => {
    setFile(null);
    setMode(null);
    setStep("selection");
    setDuplicateWarning(null);
    setSimilarWarning(null);
    setIgnoreSimilar(false);
    setError(null);
    reset();
  };

  return (
    <div className="relative">
      <AnimatePresence mode="wait">
        {step === "selection" && (
          <motion.div
            key="selection"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="grid gap-6 md:grid-cols-2"
          >
            <div
              {...getDocRootProps()}
              className={`flex cursor-pointer flex-col items-center justify-center gap-3 border-2 border-dashed p-8 text-center shadow-[4px_4px_0px_0px_currentColor] transition-all hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_currentColor] ${isDocDragActive ? "border-foreground bg-muted" : "border-foreground bg-card hover:bg-muted/40"}`}
            >
              <input {...getDocInputProps()} />
              <div className="border-2 border-foreground bg-foreground p-3 text-background">
                <UploadCloud className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-black text-base uppercase tracking-tight">Upload Document</h3>
                <p className="mt-1 font-mono text-xs text-muted-foreground">
                  Drag & drop your PDF, DOCX, PPTX, or image files here.
                </p>
              </div>
            </div>

            <div
              {...getCaptureRootProps()}
              className={`relative flex cursor-pointer flex-col items-center justify-center gap-3 border-2 border-dashed p-8 text-center shadow-[4px_4px_0px_0px_currentColor] transition-all hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_currentColor] ${isCaptureDragActive ? "border-foreground bg-muted" : "border-foreground bg-card hover:bg-muted/40"}`}
            >
              <input {...getCaptureInputProps()} capture="environment" />
              <div className="absolute right-3.5 top-3.5 border border-foreground bg-foreground px-2.5 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider text-background">
                AI Powered ✨
              </div>
              <div className="border-2 border-foreground bg-foreground p-3 text-background">
                <Camera className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-black text-base uppercase tracking-tight">Capture Paper</h3>
                <p className="mt-1 font-mono text-xs text-muted-foreground">
                  Take a photo of an exam paper. We&apos;ll extract the details automatically.
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {step === "file_preview" && file && (
          <motion.div
            key="file_preview"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="mx-auto max-w-lg border-2 border-foreground bg-card p-6 shadow-[4px_4px_0px_0px_currentColor]"
          >
            <div className="flex items-start justify-between border-b border-border pb-4">
              <div className="flex items-center gap-3.5">
                <div className="border-2 border-foreground bg-foreground p-2 text-background">
                  <FileText className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-bold text-sm uppercase tracking-tight line-clamp-1">{file.name}</p>
                  <p className="font-mono text-xs text-muted-foreground">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>
              <button onClick={cancelUpload} className="border border-foreground p-1 text-muted-foreground hover:bg-foreground hover:text-background transition-colors">
                <X className="h-4 w-4" />
              </button>
            </div>

            {duplicateWarning && (
              <div className="mt-4 border-2 border-destructive bg-destructive/10 p-3 font-mono text-xs text-destructive flex items-start gap-2">
                <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                <p>{duplicateWarning}</p>
              </div>
            )}

            <div className="mt-6 flex justify-end gap-3">
              <button onClick={cancelUpload} className="border-2 border-foreground bg-background px-4 py-2 font-mono text-xs font-bold uppercase tracking-wider hover:bg-muted transition-colors">
                Cancel
              </button>
              <button
                onClick={() => processFileForAI(file)}
                disabled={!!duplicateWarning}
                className="border-2 border-foreground bg-foreground px-5 py-2 font-mono text-xs font-bold uppercase tracking-wider text-background shadow-[2px_2px_0px_0px_currentColor] transition-all hover:bg-background hover:text-foreground disabled:opacity-50"
              >
                Continue to Details
              </button>
            </div>
          </motion.div>
        )}

        {step === "ai_processing" && (
          <motion.div
            key="ai_processing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="flex flex-col items-center justify-center border-2 border-foreground bg-card py-16 px-6 text-center shadow-[4px_4px_0px_0px_currentColor]"
          >
            <div className="mb-4 border-2 border-foreground bg-foreground p-3 text-background">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
            <h3 className="font-black text-lg uppercase tracking-tight">Analyzing Document with AI...</h3>
            <p className="mt-2 font-mono text-xs uppercase tracking-wider text-muted-foreground max-w-sm">
              Extracting university, course, subject, and other academic details to save you time.
            </p>
          </motion.div>
        )}

        {step === "form" && (
          <motion.div
            key="form"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="border-2 border-foreground bg-card p-6 sm:p-8 shadow-[4px_4px_0px_0px_currentColor]"
          >
            <div className="mb-6 flex items-center justify-between border-b-2 border-foreground pb-4">
              <div>
                <h2 className="text-xl font-black uppercase tracking-tight">Resource Details</h2>
                <p className="font-mono text-xs text-muted-foreground mt-0.5">
                  {mode === "capture" || isProcessing
                    ? "Please review and edit the AI-extracted details below." 
                    : "Fill in the details to help others find your resource."}
                </p>
              </div>
              <button onClick={cancelUpload} disabled={isSubmitting} className="border border-foreground p-1 text-muted-foreground hover:bg-foreground hover:text-background transition-colors">
                <X className="h-4 w-4" />
              </button>
            </div>

            {error && (
              <div className="mb-6 border-2 border-destructive bg-destructive/10 p-3 font-mono text-xs text-destructive flex items-center gap-2">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                {error}
              </div>
            )}

            {similarWarning && (
              <div className="mb-6 border-2 border-foreground bg-amber-500/10 p-4 font-mono text-xs text-foreground">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 flex-shrink-0 text-amber-600 dark:text-amber-400" />
                  <div>
                    <p className="font-bold uppercase tracking-wider">Possible Duplicate Detected</p>
                    <p className="mt-1">{similarWarning}</p>
                    <label className="mt-3 flex items-center gap-2 cursor-pointer font-bold uppercase tracking-wider">
                      <input 
                        type="checkbox" 
                        checked={ignoreSimilar}
                        onChange={(e) => setIgnoreSimilar(e.target.checked)}
                        className="border-2 border-foreground text-foreground focus:ring-0" 
                      />
                      I confirm this is a unique resource. Ignore warning.
                    </label>
                  </div>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="md:col-span-2">
                  <label className="mb-1.5 block font-mono text-xs font-bold uppercase tracking-wider">Title <span className="text-destructive">*</span></label>
                  <input
                    {...register("title")}
                    className="w-full border-2 border-foreground bg-background px-3 py-2 text-sm shadow-[2px_2px_0px_0px_currentColor] focus:outline-none placeholder:text-muted-foreground"
                    placeholder="e.g. Data Structures Mid-Term 2023"
                  />
                  {errors.title && <p className="mt-1 font-mono text-xs text-destructive">{errors.title.message}</p>}
                </div>

                <div className="md:col-span-2">
                  <label className="mb-1.5 block font-mono text-xs font-bold uppercase tracking-wider">Description <span className="text-destructive">*</span></label>
                  <textarea
                    {...register("description")}
                    rows={3}
                    className="w-full border-2 border-foreground bg-background px-3 py-2 text-sm shadow-[2px_2px_0px_0px_currentColor] focus:outline-none placeholder:text-muted-foreground"
                    placeholder="Briefly describe what this resource contains..."
                  />
                  {errors.description && <p className="mt-1 font-mono text-xs text-destructive">{errors.description.message}</p>}
                </div>

                <div>
                  <label className="mb-1.5 block font-mono text-xs font-bold uppercase tracking-wider">Resource Type <span className="text-destructive">*</span></label>
                  <select
                    {...register("type")}
                    className="w-full border-2 border-foreground bg-background px-3 py-2 text-sm shadow-[2px_2px_0px_0px_currentColor] focus:outline-none"
                  >
                    <option value="">Select type...</option>
                    {RESOURCE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                  {errors.type && <p className="mt-1 font-mono text-xs text-destructive">{errors.type.message}</p>}
                </div>

                <div>
                  <label className="mb-1.5 block font-mono text-xs font-bold uppercase tracking-wider">University <span className="text-destructive">*</span></label>
                  <input
                    {...register("university")}
                    className="w-full border-2 border-foreground bg-background px-3 py-2 text-sm shadow-[2px_2px_0px_0px_currentColor] focus:outline-none placeholder:text-muted-foreground"
                    placeholder="e.g. MIT, Stanford, Delhi University"
                  />
                  {errors.university && <p className="mt-1 font-mono text-xs text-destructive">{errors.university.message}</p>}
                </div>

                <div>
                  <label className="mb-1.5 block font-mono text-xs font-bold uppercase tracking-wider">Course/Degree <span className="text-destructive">*</span></label>
                  <input
                    {...register("course")}
                    className="w-full border-2 border-foreground bg-background px-3 py-2 text-sm shadow-[2px_2px_0px_0px_currentColor] focus:outline-none placeholder:text-muted-foreground"
                    placeholder="e.g. B.Tech Computer Science"
                  />
                  {errors.course && <p className="mt-1 font-mono text-xs text-destructive">{errors.course.message}</p>}
                </div>

                <div>
                  <label className="mb-1.5 block font-mono text-xs font-bold uppercase tracking-wider">Subject <span className="text-destructive">*</span></label>
                  <input
                    {...register("subject")}
                    className="w-full border-2 border-foreground bg-background px-3 py-2 text-sm shadow-[2px_2px_0px_0px_currentColor] focus:outline-none placeholder:text-muted-foreground"
                    placeholder="e.g. Data Structures"
                  />
                  {errors.subject && <p className="mt-1 font-mono text-xs text-destructive">{errors.subject.message}</p>}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-1.5 block font-mono text-xs font-bold uppercase tracking-wider">Semester <span className="text-destructive">*</span></label>
                    <input
                      type="number"
                      {...register("semester", { valueAsNumber: true })}
                      className="w-full border-2 border-foreground bg-background px-3 py-2 text-sm shadow-[2px_2px_0px_0px_currentColor] focus:outline-none"
                      min={1} max={8}
                    />
                    {errors.semester && <p className="mt-1 font-mono text-xs text-destructive">{errors.semester.message}</p>}
                  </div>
                  <div>
                    <label className="mb-1.5 block font-mono text-xs font-bold uppercase tracking-wider">Year <span className="text-destructive">*</span></label>
                    <input
                      type="number"
                      {...register("year", { valueAsNumber: true })}
                      className="w-full border-2 border-foreground bg-background px-3 py-2 text-sm shadow-[2px_2px_0px_0px_currentColor] focus:outline-none"
                      min={2000} max={new Date().getFullYear()}
                    />
                    {errors.year && <p className="mt-1 font-mono text-xs text-destructive">{errors.year.message}</p>}
                  </div>
                </div>

                <div>
                  <label className="mb-1.5 block font-mono text-xs font-bold uppercase tracking-wider">Exam Type <span className="text-muted-foreground font-normal">(Optional)</span></label>
                  <select
                    {...register("examType")}
                    className="w-full border-2 border-foreground bg-background px-3 py-2 text-sm shadow-[2px_2px_0px_0px_currentColor] focus:outline-none"
                  >
                    <option value="">Select if applicable...</option>
                    {EXAM_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="mb-1.5 block font-mono text-xs font-bold uppercase tracking-wider">Tags <span className="text-muted-foreground font-normal">(Comma separated)</span></label>
                  <input
                    {...register("tags")}
                    className="w-full border-2 border-foreground bg-background px-3 py-2 text-sm shadow-[2px_2px_0px_0px_currentColor] focus:outline-none placeholder:text-muted-foreground"
                    placeholder="e.g. algorithms, trees, important"
                  />
                  {errors.tags && <p className="mt-1 font-mono text-xs text-destructive">{errors.tags.message}</p>}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-6 border-t-2 border-foreground">
                <button
                  type="button"
                  onClick={cancelUpload}
                  disabled={isSubmitting}
                  className="border-2 border-foreground bg-background px-4 py-2 font-mono text-xs font-bold uppercase tracking-wider hover:bg-muted transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || (!!similarWarning && !ignoreSimilar)}
                  className="inline-flex items-center gap-2 border-2 border-foreground bg-foreground px-6 py-2.5 font-mono text-xs font-bold uppercase tracking-wider text-background shadow-[3px_3px_0px_0px_currentColor] transition-all hover:bg-background hover:text-foreground disabled:opacity-50"
                >
                  {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                  {isSubmitting ? "Uploading..." : "Submit for Approval"}
                </button>
              </div>
            </form>
          </motion.div>
        )}

        {step === "success" && (
          <motion.div
            key="success"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="flex flex-col items-center justify-center border-2 border-foreground bg-card p-10 text-center shadow-[4px_4px_0px_0px_currentColor]"
          >
            <div className="mb-4 border-2 border-foreground bg-foreground p-3 text-background">
              <CheckCircle2 className="h-8 w-8" />
            </div>
            <h2 className="text-2xl font-black uppercase tracking-tight">Upload Successful!</h2>
            <p className="mt-2 max-w-md font-mono text-xs uppercase tracking-wider text-muted-foreground">
              Thank you for contributing! Your resource has been instantly approved and is now publicly visible on the Resources page.
            </p>
            <div className="mt-6 flex gap-3">
              <button
                onClick={cancelUpload}
                className="border-2 border-foreground bg-background px-5 py-2 font-mono text-xs font-bold uppercase tracking-wider transition-colors hover:bg-muted"
              >
                Upload Another
              </button>
              <button
                onClick={() => router.push("/dashboard")}
                className="border-2 border-foreground bg-foreground px-5 py-2 font-mono text-xs font-bold uppercase tracking-wider text-background shadow-[2px_2px_0px_0px_currentColor] transition-all hover:bg-background hover:text-foreground"
              >
                Back to Dashboard
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

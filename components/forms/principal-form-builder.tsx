// "use client";

// import { useEffect, useMemo, useState } from "react";
// import { motion, AnimatePresence } from "framer-motion";
// import {
//   CheckCircle2,
//   ChevronLeft,
//   ChevronRight,
//   Copy,
//   FileStack,
//   Loader2,
//   Plus,
//   Settings2,
//   Trash2,
//   School,
//   FileText,
//   GraduationCap,
//   Calendar,
//   Mail,
//   Phone,
//   Upload,
//   Check,
//   AlertCircle,
//   ArrowRight,
//   Send,
// } from "lucide-react";

// import {
//   createAdmissionForm,
//   getSchoolClasses,
//   type SchoolClass,
// } from "@/lib/forms";
// import {
//   createConfiguredField,
//   DOCUMENT_FIELD_TEMPLATES,
//   FIELD_TYPE_OPTIONS,
//   PERSONAL_FIELD_TEMPLATES,
//   SCHOOL_CLASS_OPTIONS,
//   type AdmissionFormCreatePayload,
//   type AdmissionFormFieldPayload,
//   type AdmissionFormResponse,
//   type BuilderFieldType,
//   type BuilderOption,
//   type ConfiguredField,
// } from "@/lib/form-builder-config";
// import { cn } from "@/lib/utils";
// import { Button } from "@/components/ui/button";
// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardFooter,
//   CardHeader,
//   CardTitle,
// } from "@/components/ui/card";
// import { Checkbox } from "@/components/ui/checkbox";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { Switch } from "@/components/ui/switch";
// import { Textarea } from "@/components/ui/textarea";
// import { Badge } from "@/components/ui/badge";
// import { Separator } from "@/components/ui/separator";
// import {
//   Tooltip,
//   TooltipContent,
//   TooltipProvider,
//   TooltipTrigger,
// } from "@/components/ui/tooltip";
// import { Progress } from "@/components/ui/progress";
// import { ScrollArea } from "@/components/ui/scroll-area";
// import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// type ErrorMap = Record<string, string>;

// const STEP_TITLES = [
//   {
//     title: "Basic Information",
//     description: "Set form title and student information fields",
//     icon: School,
//   },
//   {
//     title: "Document Requirements",
//     description: "Configure required documents for admission",
//     icon: FileStack,
//   },
//   {
//     title: "Review & Publish",
//     description: "Set fees and publish the admission form",
//     icon: CheckCircle2,
//   },
// ];

// // Field type icons mapping for better visual recognition
// const FIELD_ICONS: Record<string, any> = {
//   text: FileText,
//   email: Mail,
//   tel: Phone,
//   number: GraduationCap,
//   date: Calendar,
//   file: Upload,
//   select: ChevronRight,
//   textarea: FileText,
// };

// function cloneField(field: ConfiguredField, index: number) {
//   return {
//     ...field,

//     // ADD THIS
//     lockedRequired: field.required,

//     id: `${field.key}-${index}-${Math.random().toString(36).slice(2, 8)}`,
//     options: field.options.map((option) => ({ ...option })),
//   };
// }

// function slugify(value: string) {
//   return value
//     .trim()
//     .toLowerCase()
//     .replace(/[^a-z0-9]+/g, "_")
//     .replace(/^_+|_+$/g, "");
// }

// function createCustomField(
//   section: "personal" | "documents",
//   count: number,
// ): ConfiguredField {
//   const key = `${section}_custom_${count + 1}`;
//   return {
//     id: `${key}-${Date.now()}`,
//     key,
//     label:
//       section === "personal" ? "Additional Information" : "Additional Document",
//     type: section === "documents" ? "file" : "text",
//     required: section === "documents",
//     placeholder: "",
//     options: [],
//     selected: true,
//     custom: true,
//     lockedType: section === "documents",
//     lockedRequired: false,
//   };
// }

// const STUDENT_FIELD_MAPPING: Record<string, string> = {
//   student_full_name: "name",
//   surname: "surname",
//   father_name: "father_name",
//   mother_name: "mother_name",
//   date_of_birth: "date_of_birth",
//   mobile_number: "mobile",
//   applying_for_class: "school_class",
//   division: "division",
// };

// function toPayloadFields(
//   fields: ConfiguredField[],
// ): AdmissionFormFieldPayload[] {
//   return fields
//     .filter((field): field is ConfiguredField => field.selected)
//     .map((field, index) => {
//       const isSelect = field.type === "select";
//       const validOptions = isSelect
//         ? field.options.filter((option) => option.label && option.value)
//         : [];
//       return {
//         label: field.label.trim(),

//         field_type: field.type,

//         required: field.required,

//         is_required: field.required,

//         order: index + 1,

//         map_to_student_field: STUDENT_FIELD_MAPPING[field.key] || null,

//         ...(field.key === "applying_for_class"
//           ? {} // just omit options entirely instead of setting null
//           : field.type === "select" && validOptions.length > 0
//             ? { options: validOptions }
//             : {}),
//       };
//     });
// }

// function FieldCard({
//   field,
//   onToggle,
//   onChange,
//   onRemove,
//   section,
//   classes,
// }: {
//   field: ConfiguredField;
//   onToggle: (checked: boolean) => void;
//   onChange: (nextField: ConfiguredField) => void;
//   onRemove?: () => void;
//   section?: "personal" | "documents";
//   classes: SchoolClass[];
// }) {
//   const [isExpanded, setIsExpanded] = useState(false);
//   const IconComponent = FIELD_ICONS[field.type] || FileText;
//   const isDocumentField = section === "documents";

//   const setOptionValue = (
//     optionIndex: number,
//     nextKey: keyof BuilderOption,
//     nextValue: string,
//   ) => {
//     const nextOptions = field.options.map((option, index) =>
//       index === optionIndex ? { ...option, [nextKey]: nextValue } : option,
//     );
//     onChange({ ...field, options: nextOptions });
//   };

//   const addOption = () => {
//     onChange({
//       ...field,
//       options: [...field.options, { label: "", value: "" }],
//     });
//   };

//   const removeOption = (optionIndex: number) => {
//     onChange({
//       ...field,
//       options: field.options.filter((_, index) => index !== optionIndex),
//     });
//   };

//   return (
//     <Card
//       className={cn(
//         "transition-all duration-300 rounded-2xl border shadow-sm hover:shadow-md hover:-translate-y-0.5",
//         field.selected
//           ? "border-indigo-300 bg-indigo-50/60 shadow-indigo-100"
//           : "border-border",
//       )}
//     >
//       <CardHeader className="p-4">
//         <div className="flex items-start gap-3">
//           <TooltipProvider>
//             <Tooltip>
//               <TooltipTrigger asChild>
//                 <div>
//                   <Checkbox
//                     checked={field.selected}
//                     disabled={
//                       field.key === "applying_for_class" || field.lockedType
//                     }
//                     onCheckedChange={(checked) => onToggle(Boolean(checked))}
//                     className="mt-1"
//                   />
//                 </div>
//               </TooltipTrigger>

//               {field.key === "applying_for_class" && (
//                 <TooltipContent>
//                   This field is mandatory and cannot be deselected
//                 </TooltipContent>
//               )}
//             </Tooltip>
//           </TooltipProvider>

//           <div className="flex-1 min-w-0">
//             <div className="flex items-center gap-2 flex-wrap mb-1">
//               <IconComponent className="h-4 w-4 text-muted-foreground" />
//               <h4 className="font-medium text-sm">{field.label}</h4>
//               {field.required && (
//                 <Badge
//                   variant="destructive"
//                   className="text-[10px] px-1.5 py-0"
//                 >
//                   Required
//                 </Badge>
//               )}
//               {field.custom && (
//                 <Badge variant="outline" className="text-[10px] px-1.5 py-0">
//                   Custom
//                 </Badge>
//               )}
//             </div>
//             <div className="flex items-center gap-3 text-xs text-muted-foreground">
//               <span>
//                 Key: <code className="font-mono text-xs">{field.key}</code>
//               </span>
//               <span>•</span>
//               <span>
//                 Type: {field.key === "applying_for_class" ? "text" : field.type}
//               </span>
//             </div>
//           </div>

//           <div className="flex items-center gap-1">
//             <TooltipProvider>
//               <Tooltip>
//                 <TooltipTrigger asChild>
//                   <Button
//                     variant="ghost"
//                     size="sm"
//                     className="h-8 w-8 p-0"
//                     onClick={() => setIsExpanded(!isExpanded)}
//                   >
//                     <Settings2 className="h-4 w-4" />
//                   </Button>
//                 </TooltipTrigger>
//                 <TooltipContent>Configure field</TooltipContent>
//               </Tooltip>
//             </TooltipProvider>

//             {onRemove && (
//               <TooltipProvider>
//                 <Tooltip>
//                   <TooltipTrigger asChild>
//                     <Button
//                       variant="ghost"
//                       size="sm"
//                       className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
//                       onClick={onRemove}
//                     >
//                       <Trash2 className="h-4 w-4" />
//                     </Button>
//                   </TooltipTrigger>
//                   <TooltipContent>Remove field</TooltipContent>
//                 </Tooltip>
//               </TooltipProvider>
//             )}
//           </div>
//         </div>
//       </CardHeader>

//       <AnimatePresence>
//         {field.selected && isExpanded && (
//           <motion.div
//             initial={{ height: 0, opacity: 0 }}
//             animate={{ height: "auto", opacity: 1 }}
//             exit={{ height: 0, opacity: 0 }}
//           >
//             <CardContent className="px-4 pb-4 pt-0">
//               <Separator className="mb-4" />

//               <div className="grid gap-4 md:grid-cols-2">
//                 <div className="space-y-1.5">
//                   <Label className="text-xs font-medium">Field Label</Label>
//                   <Input
//                     value={field.label}
//                     onChange={(e) =>
//                       onChange({ ...field, label: e.target.value })
//                     }
//                     placeholder="Field Name"
//                     className="h-11 rounded-xl"
//                   />
//                 </div>

//                 {!isDocumentField && (
//                   <div className="space-y-1.5">
//                     <Label className="text-xs font-medium">Field Type</Label>

//                     <select
//                       className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm outline-none focus:ring-1 focus:ring-primary disabled:cursor-not-allowed disabled:opacity-60"
//                       value={
//                         field.key === "applying_for_class" ? "text" : field.type
//                       }
//                       disabled={field.key === "applying_for_class"}
//                       onChange={(e) =>
//                         onChange({
//                           ...field,
//                           type: e.target.value as BuilderFieldType,
//                           options:
//                             e.target.value === "select" && !field.options.length
//                               ? [{ label: "", value: "" }]
//                               : field.options,
//                         })
//                       }
//                     >
//                       {FIELD_TYPE_OPTIONS.map((option, index) => (
//                         <option
//                           key={option.value || `field-option-${index}`}
//                           value={option.value}
//                         >
//                           {option.label}
//                         </option>
//                       ))}
//                     </select>
//                   </div>
//                 )}

//                 {!field.lockedRequired && !isDocumentField && (
//                   <div className="mt-4 flex items-center justify-between py-2">
//                     <div>
//                       <Label className="text-sm font-medium">
//                         Required Field
//                       </Label>

//                       <p className="text-xs text-muted-foreground">
//                         Applicant must fill this field
//                       </p>
//                     </div>

//                     <Switch
//                       checked={field.required}
//                       onCheckedChange={(checked) =>
//                         onChange({
//                           ...field,
//                           required: Boolean(checked),
//                         })
//                       }
//                     />
//                   </div>
//                 )}
//               </div>

//               {/* Show options for select fields (except applying_for_class) */}
//               {field.type === "select" &&
//                 field.key !== "applying_for_class" && (
//                   <div className="mt-4 space-y-3">
//                     <div className="flex items-center justify-between">
//                       <Label className="text-sm font-medium">
//                         Dropdown Options
//                       </Label>
//                       <Button
//                         type="button"
//                         variant="outline"
//                         size="sm"
//                         onClick={addOption}
//                       >
//                         <Plus className="mr-1 h-3 w-3" />
//                         Add Option
//                       </Button>
//                     </div>

//                     <div className="space-y-2">
//                       {field.options.map((option, index) => (
//                         <div
//                           key={`${option.value || "option"}-${index}`}
//                           className="flex gap-2"
//                         >
//                           <Input
//                             value={option.label}
//                             placeholder="Display Label"
//                             onChange={(e) =>
//                               setOptionValue(index, "label", e.target.value)
//                             }
//                             className="h-9"
//                           />
//                           <Input
//                             value={option.value}
//                             placeholder="Value"
//                             onChange={(e) =>
//                               setOptionValue(index, "value", e.target.value)
//                             }
//                             className="h-9"
//                           />
//                           <Button
//                             type="button"
//                             variant="ghost"
//                             size="sm"
//                             onClick={() => removeOption(index)}
//                             className="h-9 w-9 p-0"
//                           >
//                             <Trash2 className="h-4 w-4" />
//                           </Button>
//                         </div>
//                       ))}
//                     </div>
//                   </div>
//                 )}
//             </CardContent>
//           </motion.div>
//         )}
//       </AnimatePresence>
//     </Card>
//   );
// }

// type Section = {
//   id: number;
//   title: string;
//   order: number;
//   fields: ConfiguredField[];
// };

// export default function PrincipalFormBuilder({
//   onSuccess,
// }: {
//   onSuccess?: (form: AdmissionFormResponse) => void;
// }) {
//   const [currentStep, setCurrentStep] = useState(0);
//   const [academicYear, setAcademicYear] = useState("2024-2025");
//   const [title, setTitle] = useState("Student Admission Form");
//   const [description, setDescription] = useState("");
//   // const [personalSectionTitle, setPersonalSectionTitle] = useState(
//   //   "Student Information",
//   // );

//   const [documentSectionTitle, setDocumentSectionTitle] =
//     useState("Required Documents");

//   const [sections, setSections] = useState<Section[]>([
//     {
//       id: Date.now(),
//       title: "Student Information",
//       order: 1,
//       fields: PERSONAL_FIELD_TEMPLATES.map((field, index) => {
//         const configuredField = createConfiguredField(field);

//         // this for the checkbox
//         // if (configuredField.key === "applying_for_class") {
//         //   configuredField.options = [];
//         // }

//         // if (configuredField.key === "applying_for_class") {
//         //   configuredField.options = classes.map((cls) => ({
//         //     label: cls.school_class,
//         //     value: String(cls.id),
//         //   }));
//         // }

//         if (configuredField.key === "applying_for_class") {
//           configuredField.options = [];
//         }

//         return cloneField(configuredField, index);
//       }),
//     },
//   ]);
//   const [documentFields, setDocumentFields] = useState<ConfiguredField[]>(
//     DOCUMENT_FIELD_TEMPLATES.map((field, index) =>
//       cloneField(createConfiguredField(field), index),
//     ),
//   );

//   const [feesEnabled, setFeesEnabled] = useState(false);
//   const [paymentMode, setPaymentMode] = useState<"online" | "offline">(
//     "online",
//   );
//   const [feeType, setFeeType] = useState<"general" | "individual">("general");
//   const [feesAmount, setFeesAmount] = useState("");
//   const [individualFees, setIndividualFees] = useState<Record<number, string>>(
//     {},
//   );
//   const [errors, setErrors] = useState<ErrorMap>({});
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [submitError, setSubmitError] = useState("");
//   const [createdForm, setCreatedForm] = useState<AdmissionFormResponse | null>(
//     null,
//   );
//   const [classes, setClasses] = useState<SchoolClass[]>([]);

//   useEffect(() => {
//     async function fetchClasses() {
//       try {
//         const data = await getSchoolClasses();
//         if (data && data.length > 0) {
//           // Sort classes based on predefined order
//           const sortedData = [...data].sort((a, b) => {
//             const indexA = SCHOOL_CLASS_OPTIONS.findIndex(
//               (opt) => opt.value === a.school_class,
//             );
//             const indexB = SCHOOL_CLASS_OPTIONS.findIndex(
//               (opt) => opt.value === b.school_class,
//             );
//             // If not found, put at the end
//             if (indexA === -1) return 1;
//             if (indexB === -1) return -1;
//             return indexA - indexB;
//           });

//           setClasses(sortedData);

//           // setSections((prev) =>
//           //   prev.map((section) => ({
//           //     ...section,
//           //     fields: section.fields.map((field) =>
//           //       field.key === "applying_for_class"
//           //         ? {
//           //             ...field,
//           //             options: sortedData.map((cls) => ({
//           //               label: cls.school_class,
//           //               value: String(cls.id),
//           //             })),
//           //           }
//           //         : field,
//           //     ),
//           //   })),
//           // );

//           setSections((prev) =>
//             prev.map((section) => ({
//               ...section,
//               fields: section.fields.map((field) =>
//                 field.key === "applying_for_class"
//                   ? {
//                       ...field,
//                       options: sortedData.map((cls) => ({
//                         label: cls.school_class,
//                         value: String(cls.id),
//                       })),
//                     }
//                   : field,
//               ),
//             })),
//           );

//           // Initialize individual fees
//           const initialFees: Record<number, string> = {};
//           sortedData.forEach((cls) => {
//             initialFees[cls.id] = "";
//           });
//           setIndividualFees(initialFees);

//           // Update initial personal fields if they contain the class selector
//           // setPersonalFields((current) =>
//           //   current.map((field) => {
//           //     if (
//           //       field.label.toLowerCase().includes("class") ||
//           //       field.key.includes("class")
//           //     ) {
//           //       return { ...field, options: classOptions };
//           //     }
//           //     return field;
//           //   }),
//           // );
//         }
//       } catch (err) {
//         console.error("Failed to fetch classes:", err);
//       }
//     }
//     fetchClasses();
//   }, []);

//   const payload = useMemo<AdmissionFormCreatePayload>(() => {
//     const formattedSections = sections.map((section, index) => ({
//       title: section.title.trim() || `Section ${index + 1}`,
//       order: index + 1,
//       fields: toPayloadFields(section.fields),
//     }));
//     const document_fields = documentFields
//       .filter((field) => field.selected)
//       .map((field) => field.label.trim());

//     const formTitle = `${title.trim()} ${academicYear}`.trim();

//     return {
//       fees_enable: feesEnabled,
//       fees:
//         feesEnabled && feeType === "general" ? Number(feesAmount) || 0 : null,
//       title: formTitle,
//       description:
//         description.trim() ||
//         `Admission form for academic year ${academicYear}`,
//       unique_link: slugify(formTitle),
//       fee_type: feeType,
//       payment_mode: feesEnabled ? paymentMode : null,
//       sections: formattedSections,
//       document_fields,
//       fee_structures_input:
//         feesEnabled && feeType === "individual"
//           ? Object.entries(individualFees)
//               .filter(([_, amt]) => amt && Number(amt) > 0)
//               .map(([id, amt]) => ({
//                 class_name: Number(id),
//                 fee_amount: Number(amt).toFixed(2),
//               }))
//           : [],
//     };
//   }, [
//     academicYear,
//     classes,
//     description,
//     documentFields,
//     feeType,
//     feesAmount,
//     feesEnabled,
//     individualFees,
//     sections,
//     title,
//   ]);

//   const validateStep = (step: number) => {
//     const nextErrors: ErrorMap = {};

//     if (step === 0) {
//       if (!title.trim()) {
//         nextErrors.title = "Form title is required";
//       }
//       const hasFields = payload.sections.some(
//         (section) => section.fields.length > 0,
//       );

//       if (!hasFields) {
//         nextErrors.personalFields = "At least one section field is required";
//       }

//       // this logic is for the check box
//       // const applyingField = sections
//       //   .flatMap((section) => section.fields)
//       //   .find((field) => field.key === "applying_for_class");

//       // if (!applyingField || applyingField.options.length === 0) {
//       //   nextErrors.applying_for_class =
//       //     "Please configure the 'Applying For Class' field by selecting at least one class option below.";
//       // }
//     }

//     if (step === 2 && feesEnabled) {
//       if (feeType === "general" && !feesAmount.trim()) {
//         nextErrors.fees = "Application fee amount is required";
//       } else if (feeType === "individual") {
//         const hasAnyFee = Object.values(individualFees).some(
//           (amt) => amt && Number(amt) > 0,
//         );
//         if (!hasAnyFee) {
//           nextErrors.fees = "Please set at least one class fee";
//         }
//       }
//     }

//     setErrors(nextErrors);
//     return Object.keys(nextErrors).length === 0;
//   };

//   const nextStep = () => {
//     if (!validateStep(currentStep)) {
//       return;
//     }
//     setCurrentStep((value) => Math.min(value + 1, STEP_TITLES.length - 1));
//   };

//   const previousStep = () => {
//     setErrors({});
//     setCurrentStep((value) => Math.max(value - 1, 0));
//   };

//   const submitForm = async () => {
//     if (!validateStep(2)) {
//       return;
//     }

//     setIsSubmitting(true);
//     setSubmitError("");

//     try {
//       const response = await createAdmissionForm(payload);
//       setCreatedForm(response);
//       onSuccess?.(response);
//     } catch (error) {
//       setSubmitError(
//         error instanceof Error
//           ? error.message
//           : "Failed to create admission form",
//       );
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   const updateFieldList = (
//     updater: (fields: ConfiguredField[]) => ConfiguredField[],
//   ): void => {
//     setDocumentFields((current: ConfiguredField[]) => updater(current));
//   };

//   const updateSectionFields = (
//     sectionId: number,
//     updater: (fields: ConfiguredField[]) => ConfiguredField[],
//   ) => {
//     setSections((current) =>
//       current.map((section) => {
//         if (section.id === sectionId) {
//           return {
//             ...section,
//             fields: updater(section.fields),
//           };
//         }
//         return section;
//       }),
//     );
//   };

//   const sortFields = (fields: ConfiguredField[]) => {
//     return [...fields].sort((a, b) => {
//       // Applying For Class always first
//       if (a.key === "applying_for_class") return -1;
//       if (b.key === "applying_for_class") return 1;

//       // Required fields after that
//       // if (a.required && !b.required) return -1;
//       // if (!a.required && b.required) return 1;

//       return 0;
//     });
//   };

//   const getSelectedCount = (fields: ConfiguredField[]) => {
//     return fields.filter((f) => f.selected).length;
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/40">
//       <div className="mx-auto max-w-7xl px-4 py-6 lg:px-8">
//         {/* Header */}
//         <div className="mb-8 rounded-3xl border border-slate-200/70 bg-white/80 backdrop-blur-xl shadow-sm p-6">
//           <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
//             <School className="h-4 w-4" />
//             <span>Admission Management</span>
//             <ChevronRight className="h-4 w-4" />
//             <span className="text-foreground font-medium">Form Builder</span>
//           </div>

//           <div className="flex items-start justify-between">
//             <div>
//               <h1 className="text-3xl lg:text-4xl font-black tracking-tight text-slate-900">
//                 Create Admission Form
//               </h1>
//               <p className="text-base text-slate-500 mt-2 font-medium">
//                 Configure the admission form for the upcoming academic session
//               </p>
//             </div>

//             <select
//               className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
//               value={academicYear}
//               onChange={(e: any) => setAcademicYear(e.target.value)}
//             >
//               <option value="2024-2025">Academic Year 2024-2025</option>
//               <option value="2025-2026">Academic Year 2025-2026</option>
//               <option value="2026-2027">Academic Year 2026-2027</option>
//             </select>
//           </div>
//         </div>

//         {/* Progress Steps */}
//         <div className="mb-10 rounded-3xl border border-slate-200 bg-white shadow-sm p-6">
//           <div className="flex items-center justify-between">
//             {STEP_TITLES.map((step, index) => {
//               const Icon = step.icon;
//               const isActive = currentStep === index;
//               const isComplete = currentStep > index;

//               return (
//                 <div
//                   key={step.title || `step-${index}`}
//                   className="flex items-center flex-1"
//                 >
//                   <div
//                     className={cn(
//                       "flex items-center gap-3",
//                       index > 0 && "ml-4",
//                     )}
//                   >
//                     <div
//                       className={cn(
//                         "flex h-12 w-12 items-center justify-center rounded-2xl border-2 transition-all duration-300 shadow-sm",
//                         isActive &&
//                           "border-indigo-600 bg-indigo-600 text-white shadow-lg shadow-indigo-200",
//                         isComplete &&
//                           "border-emerald-500 bg-emerald-50 text-emerald-600",
//                         !isActive &&
//                           !isComplete &&
//                           "border-muted-foreground/25 text-muted-foreground",
//                       )}
//                     >
//                       {isComplete ? (
//                         <Check className="h-5 w-5" />
//                       ) : (
//                         <Icon className="h-5 w-5" />
//                       )}
//                     </div>
//                     <div
//                       className={cn(
//                         "hidden sm:block",
//                         !isActive && "opacity-60",
//                       )}
//                     >
//                       <p className="text-sm font-medium">{step.title}</p>
//                       <p className="text-xs text-muted-foreground">
//                         {step.description}
//                       </p>
//                     </div>
//                   </div>

//                   {index < STEP_TITLES.length - 1 && (
//                     <div
//                       className={cn(
//                         "mx-4 h-0.5 flex-1",
//                         currentStep > index ? "bg-primary" : "bg-muted",
//                       )}
//                     />
//                   )}
//                 </div>
//               );
//             })}
//           </div>
//         </div>

//         {/* Main Content */}
//         <Card className="border-slate-200 rounded-[2rem] shadow-xl shadow-slate-100 overflow-hidden bg-white/95 backdrop-blur">
//           {currentStep === 0 && (
//             <>
//               <CardHeader className="pb-6 border-b border-slate-100 bg-slate-50/50">
//                 <CardTitle>Form Details</CardTitle>
//                 <CardDescription className="text-slate-500 text-base">
//                   Set the basic information and choose student information
//                   fields
//                 </CardDescription>
//               </CardHeader>

//               <CardContent className="space-y-6">
//                 {/* Form Metadata */}
//                 <div className="grid gap-4 md:grid-cols-2">
//                   <div className="space-y-1.5">
//                     <Label htmlFor="form-title">Form Title</Label>
//                     <Input
//                       id="form-title"
//                       value={title}
//                       onChange={(e) => setTitle(e.target.value)}
//                       placeholder="e.g., Class XI Admission"
//                     />
//                     {errors.title && (
//                       <p className="text-xs text-destructive">{errors.title}</p>
//                     )}
//                   </div>

//                   <div className="space-y-1.5">
//                     <Label htmlFor="section-title">Section Title</Label>

//                     <Input
//                       id="section-title"
//                       value={sections[0]?.title || ""}
//                       onChange={(e) => {
//                         const updated = [...sections];
//                         updated[0].title = e.target.value;
//                         setSections(updated);
//                       }}
//                       placeholder="Section Title"
//                     />
//                   </div>

//                   <div className="space-y-1.5 md:col-span-2">
//                     <Label htmlFor="form-description">
//                       Description (Optional)
//                     </Label>
//                     <Textarea
//                       id="form-description"
//                       value={description}
//                       onChange={(e) => setDescription(e.target.value)}
//                       placeholder="Brief description about this admission form..."
//                       className="resize-none"
//                       rows={2}
//                     />
//                   </div>
//                 </div>

//                 <Separator />

//                 {/* Student Information Fields */}
//                 <div className="space-y-6">
//                   {sections.map((section, sectionIndex) => (
//                     <div
//                       key={section.id}
//                       className="rounded-3xl border border-slate-200 bg-slate-50/50 p-6 space-y-5 shadow-sm"
//                     >
//                       {sectionIndex !== 0 && (
//                         <div className="flex items-center justify-between">
//                           <div className="flex items-center gap-3 w-full">
//                             <Input
//                               value={section.title}
//                               onChange={(e) => {
//                                 const updated = [...sections];
//                                 updated[sectionIndex].title = e.target.value;
//                                 setSections(updated);
//                               }}
//                               placeholder="Section Title"
//                             />
//                           </div>
//                         </div>
//                       )}

//                       <div className="flex justify-end mb-5">
//                         {/* Right Side */}
//                         <div className="flex items-center gap-3">
//                           <div className="rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-700">
//                             {getSelectedCount(section.fields)} selected
//                           </div>

//                           <Button
//                             variant="outline"
//                             size="sm"
//                             className="rounded-xl px-4 shadow-sm hover:shadow-md transition-all"
//                             onClick={() =>
//                               updateSectionFields(section.id, (fields) => [
//                                 ...fields,
//                                 createCustomField(
//                                   "personal",
//                                   fields.filter((f) => f.custom).length,
//                                 ),
//                               ])
//                             }
//                           >
//                             <Plus className="mr-2 h-4 w-4" />
//                             Add Field
//                           </Button>
//                         </div>
//                       </div>

//                       <div className="space-y-3">
//                         {sortFields(section.fields).map((field, index) => (
//                           <div key={field.id}>
//                             {field.key === "applying_for_class" &&
//                               errors.applying_for_class && (
//                                 <Alert variant="destructive" className="mb-3">
//                                   <AlertCircle className="h-4 w-4" />

//                                   <AlertDescription>
//                                     {errors.applying_for_class}
//                                   </AlertDescription>
//                                 </Alert>
//                               )}

//                             <FieldCard
//                               field={field}
//                               classes={classes}
//                               onToggle={(checked) =>
//                                 updateSectionFields(section.id, (fields) =>
//                                   fields.map((item) =>
//                                     item.id === field.id
//                                       ? {
//                                           ...item,
//                                           selected:
//                                             item.key === "applying_for_class"
//                                               ? true
//                                               : checked,
//                                         }
//                                       : item,
//                                   ),
//                                 )
//                               }
//                               onChange={(nextField) =>
//                                 updateSectionFields(section.id, (fields) =>
//                                   fields.map((item) =>
//                                     item.id === field.id ? nextField : item,
//                                   ),
//                                 )
//                               }
//                               onRemove={
//                                 field.custom
//                                   ? () =>
//                                       updateSectionFields(
//                                         section.id,
//                                         (fields) =>
//                                           fields.filter(
//                                             (item) => item.id !== field.id,
//                                           ),
//                                       )
//                                   : undefined
//                               }
//                             />
//                           </div>
//                         ))}
//                       </div>
//                     </div>
//                   ))}

//                   <Button
//                     variant="outline"
//                     className="w-full h-14 rounded-2xl border-dashed border-2 border-slate-300 hover:border-indigo-400 hover:bg-indigo-50 font-bold"
//                     onClick={() => {
//                       setSections((prev) => [
//                         ...prev,
//                         {
//                           id: Date.now(),
//                           title: `Section ${prev.length + 1}`,
//                           order: prev.length + 1,
//                           fields: [],
//                         },
//                       ]);
//                     }}
//                   >
//                     <Plus className="mr-2 h-4 w-4" />
//                     Add Section
//                   </Button>
//                 </div>
//               </CardContent>
//             </>
//           )}

//           {currentStep === 1 && (
//             <>
//               <CardHeader>
//                 <CardTitle>Document Requirements</CardTitle>
//                 <CardDescription>
//                   Configure documents that applicants need to submit
//                 </CardDescription>
//               </CardHeader>

//               <CardContent className="space-y-6">
//                 <div className="space-y-1.5 max-w-md">
//                   <Label htmlFor="doc-section-title">Section Title</Label>
//                   <Input
//                     id="doc-section-title"
//                     value={documentSectionTitle}
//                     onChange={(e) => setDocumentSectionTitle(e.target.value)}
//                   />
//                 </div>

//                 <Separator />

//                 <div className="space-y-4">
//                   <div className="flex items-center justify-between">
//                     <div>
//                       <h3 className="font-medium">Document Fields</h3>
//                       <p className="text-sm text-muted-foreground">
//                         Specify required documents and supporting files
//                       </p>
//                     </div>

//                     <div className="flex items-center gap-2">
//                       <Badge variant="secondary">
//                         {getSelectedCount(documentFields)} selected
//                       </Badge>
//                       <Button
//                         variant="outline"
//                         size="sm"
//                         onClick={() =>
//                           updateFieldList((fields) => [
//                             ...fields,
//                             createCustomField(
//                               "documents",
//                               fields.filter((f) => f.custom).length,
//                             ),
//                           ])
//                         }
//                       >
//                         <Plus className="mr-1 h-4 w-4" />
//                         Add Field
//                       </Button>
//                     </div>
//                   </div>

//                   <ScrollArea className="h-[500px] pr-4 rounded-2xl">
//                     <div className="space-y-3">
//                       {sortFields(documentFields).map((field, index) => (
//                         <FieldCard
//                           section="documents"
//                           classes={classes}
//                           key={field.id || `document-field-${index}`}
//                           field={field}
//                           onToggle={(checked) =>
//                             updateFieldList((fields) =>
//                               fields.map((item) =>
//                                 item.id === field.id
//                                   ? { ...item, selected: checked }
//                                   : item,
//                               ),
//                             )
//                           }
//                           onChange={(nextField) =>
//                             updateFieldList((fields) =>
//                               fields.map((item) =>
//                                 item.id === field.id
//                                   ? {
//                                       ...nextField,
//                                       type: "file",
//                                       required: true,
//                                     }
//                                   : item,
//                               ),
//                             )
//                           }
//                           onRemove={
//                             field.custom
//                               ? () =>
//                                   updateFieldList((fields) =>
//                                     fields.filter(
//                                       (item) => item.id !== field.id,
//                                     ),
//                                   )
//                               : undefined
//                           }
//                         />
//                       ))}
//                     </div>
//                   </ScrollArea>
//                 </div>
//               </CardContent>
//             </>
//           )}

//           {currentStep === 2 && (
//             <>
//               <CardHeader>
//                 <CardTitle>Review & Publish</CardTitle>
//                 <CardDescription>
//                   Set application fee and review the form configuration
//                 </CardDescription>
//               </CardHeader>

//               <CardContent className="space-y-6">
//                 <div className="grid gap-6 md:max-w-xl">
//                   <div className="space-y-4">
//                     {/* Application Fee */}
//                     <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
//                       <div className="flex items-center justify-between mb-3">
//                         <div>
//                           <h4 className="font-medium">Application Fee</h4>
//                           <p className="text-sm text-muted-foreground">
//                             Charge a fee for form submission
//                           </p>
//                         </div>
//                         <Switch
//                           checked={feesEnabled}
//                           onCheckedChange={setFeesEnabled}
//                         />
//                       </div>

//                       {feesEnabled && (
//                         <div className="space-y-4 pt-2">
//                           <div className="flex bg-muted p-1 rounded-lg w-full max-w-[300px]">
//                             <button
//                               type="button"
//                               onClick={() => setFeeType("general")}
//                               className={cn(
//                                 "flex-1 px-3 py-1.5 text-xs font-medium rounded-md transition-all",
//                                 feeType === "general"
//                                   ? "bg-white text-foreground shadow-sm"
//                                   : "text-muted-foreground hover:text-foreground",
//                               )}
//                             >
//                               General Fee
//                             </button>
//                             <button
//                               type="button"
//                               onClick={() => setFeeType("individual")}
//                               className={cn(
//                                 "flex-1 px-3 py-1.5 text-xs font-medium rounded-md transition-all",
//                                 feeType === "individual"
//                                   ? "bg-white text-foreground shadow-sm"
//                                   : "text-muted-foreground hover:text-foreground",
//                               )}
//                             >
//                               Individual Fees
//                             </button>
//                           </div>


//                           {feeType === "general" ? (
//                             <div className="space-y-1.5">
//                               <Label htmlFor="fees-amount">Amount (INR)</Label>
//                               <div className="relative">
//                                 <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
//                                   ₹
//                                 </span>
//                                 <Input
//                                   id="fees-amount"
//                                   type="number"
//                                   min="0"
//                                   value={feesAmount}
//                                   onChange={(e) =>
//                                     setFeesAmount(e.target.value)
//                                   }
//                                   placeholder="500"
//                                   className="pl-7"
//                                 />
//                               </div>
//                               <p className="text-[10px] text-muted-foreground italic">
//                                 This amount will apply to all classes.
//                               </p>
//                               {errors.fees && (
//                                 <p className="text-xs text-destructive">
//                                   {errors.fees}
//                                 </p>
//                               )}
//                             </div>
//                           ) : (
//                             <div className="space-y-3">
//                               <div className="flex items-center justify-between">
//                                 <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
//                                   Class-wise Fees
//                                 </Label>
//                                 <Button
//                                   variant="ghost"
//                                   size="sm"
//                                   className="h-7 text-[10px] gap-1 px-2"
//                                   onClick={() => {
//                                     const firstAmt =
//                                       Object.values(individualFees).find(
//                                         (v) => v !== "",
//                                       ) || "0";
//                                     const next = { ...individualFees };
//                                     classes.forEach(
//                                       (c) => (next[c.id] = firstAmt),
//                                     );
//                                     setIndividualFees(next);
//                                   }}
//                                 >
//                                   <Copy className="h-3 w-3" />
//                                   Apply first to all
//                                 </Button>
//                               </div>
//                               <ScrollArea className="h-[240px] rounded-md border bg-slate-50/50 p-3">
//                                 <div className="space-y-2">
//                                   {classes.map((cls, index) => (
//                                     <div
//                                       key={cls.id || `class-${index}`}
//                                       className="flex items-center justify-between gap-4 bg-white p-2 rounded-lg border border-slate-200"
//                                     >
//                                       <span className="text-sm font-medium">
//                                         {cls.school_class}
//                                       </span>
//                                       <div className="relative w-32">
//                                         <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground text-xs">
//                                           ₹
//                                         </span>
//                                         <Input
//                                           type="number"
//                                           min="0"
//                                           value={individualFees[cls.id] || ""}
//                                           onChange={(e) =>
//                                             setIndividualFees((prev) => ({
//                                               ...prev,
//                                               [cls.id]: e.target.value,
//                                             }))
//                                           }
//                                           className="h-8 pl-5 text-sm"
//                                           placeholder="0"
//                                         />
//                                       </div>
//                                     </div>
//                                   ))}
//                                 </div>
//                               </ScrollArea>
//                             </div>
//                           )}
//                         </div>
//                       )}
//                     </div>

//                     {/* Form Summary */}
//                     <div className="rounded-lg border p-4">
//                       <h4 className="font-medium mb-3">Form Summary</h4>
//                       <div className="space-y-2 text-sm">
//                         <div className="flex justify-between">
//                           <span className="text-muted-foreground">
//                             Academic Year
//                           </span>
//                           <span className="font-medium">{academicYear}</span>
//                         </div>
//                         <div className="flex justify-between">
//                           <span className="text-muted-foreground">
//                             Student Fields
//                           </span>
//                           <span className="font-medium">
//                             {/* {getSelectedCount(personalFields)} */}
//                             {sections.reduce(
//                               (total, section) =>
//                                 total + getSelectedCount(section.fields),
//                               0,
//                             )}
//                           </span>
//                         </div>
//                         <div className="flex justify-between">
//                           <span className="text-muted-foreground">
//                             Document Fields
//                           </span>
//                           <span className="font-medium">
//                             {getSelectedCount(documentFields)}
//                           </span>
//                         </div>
//                         <Separator className="my-2" />
//                         <div className="flex justify-between">
//                           <span className="text-muted-foreground">
//                             Total Fields
//                           </span>
//                           <span className="font-medium">
//                             {sections.reduce(
//                               (total, section) =>
//                                 total + getSelectedCount(section.fields),
//                               0,
//                             ) + getSelectedCount(documentFields)}
//                           </span>
//                         </div>
//                         <div className="flex justify-between">
//                           <span className="text-muted-foreground">
//                             Application Fee
//                           </span>

//                           <span className="font-medium">
//                             {!feesEnabled
//                               ? "Free"
//                               : feeType === "individual"
//                                 ? "Individual Fee"
//                                 : `₹${feesAmount || "0"}`}
//                           </span>
//                         </div>
//                       </div>
//                     </div>
//                   </div>
//                 </div>

//                 {/* Success Message */}
//                 {createdForm && (
//                   <Alert className="border-green-200 bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl shadow-sm">
//                     <CheckCircle2 className="h-4 w-4 text-green-600" />
//                     <AlertTitle className="text-green-900">
//                       Form Created Successfully
//                     </AlertTitle>
//                     <AlertDescription className="text-green-700">
//                       <p>Form ID: {createdForm.id}</p>
//                       <p className="mt-1">
//                         Share this link with applicants:{" "}
//                         <code className="text-xs bg-green-100 px-2 py-0.5 rounded">
//                           {createdForm.unique_link}
//                         </code>
//                       </p>
//                     </AlertDescription>
//                   </Alert>
//                 )}

//                 {/* Error Message */}
//                 {submitError && (
//                   <Alert variant="destructive">
//                     <AlertCircle className="h-4 w-4" />
//                     <AlertDescription>{submitError}</AlertDescription>
//                   </Alert>
//                 )}
//               </CardContent>
//             </>
//           )}

//           <CardFooter className="sticky bottom-0 z-20 border-t border-slate-200 bg-white/90 backdrop-blur px-6 py-5">
//             <div className="flex items-center justify-between w-full relative">
//               <Button
//                 variant="ghost"
//                 onClick={previousStep}
//                 disabled={currentStep === 0}
//               >
//                 <ChevronLeft className="mr-1 h-4 w-4" />
//                 Back
//               </Button>

//               {/* error message for the class select */}
//               {/* <div className="mt-2">
//                 {errors.applying_for_class && (
//                   <Alert
//                     variant="destructive"
//                     className="rounded-xl border border-red-200 bg-white shadow-sm px-4 py-2"
//                   >
//                     <div className="flex items-center gap-2">
//                       <AlertCircle className="h-4 w-4 shrink-0 text-red-600" />
//                       <AlertDescription className="text-sm font-medium text-red-600">
//                         {errors.applying_for_class}
//                       </AlertDescription>
//                     </div>
//                   </Alert>
//                 )}
//               </div> */}

//               <div className="flex items-center gap-3">
//                 {currentStep < STEP_TITLES.length - 1 ? (
//                   <Button
//                     onClick={nextStep}
//                     className="h-12 px-8 rounded-2xl bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-200 font-bold"
//                   >
//                     Continue
//                     <ArrowRight className="ml-1 h-4 w-4" />
//                   </Button>
//                 ) : (
//                   <Button
//                     onClick={submitForm}
//                     disabled={isSubmitting}
//                     className="h-12 px-8 rounded-2xl bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-200 font-bold"
//                   >
//                     {isSubmitting ? (
//                       <>
//                         <Loader2 className="mr-2 h-4 w-4 animate-spin" />
//                         Publishing...
//                       </>
//                     ) : (
//                       <>
//                         <Send className="mr-2 h-4 w-4" />
//                         Publish Form
//                       </>
//                     )}
//                   </Button>
//                 )}
//               </div>
//             </div>
//           </CardFooter>
//         </Card>
//       </div>
//     </div>
//   );
// }





"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Copy,
  FileStack,
  Loader2,
  Plus,
  Settings2,
  Trash2,
  School,
  FileText,
  GraduationCap,
  Calendar,
  Mail,
  Phone,
  Upload,
  Check,
  AlertCircle,
  ArrowRight,
  Send,
  X,
  Sparkles,
  BookOpen,
  IndianRupee,
  LayoutGrid,
} from "lucide-react";

import {
  createAdmissionForm,
  getSchoolClasses,
  type SchoolClass,
} from "@/lib/forms";
import {
  createConfiguredField,
  DOCUMENT_FIELD_TEMPLATES,
  FIELD_TYPE_OPTIONS,
  PERSONAL_FIELD_TEMPLATES,
  SCHOOL_CLASS_OPTIONS,
  type AdmissionFormCreatePayload,
  type AdmissionFormFieldPayload,
  type AdmissionFormResponse,
  type BuilderFieldType,
  type BuilderOption,
  type ConfiguredField,
} from "@/lib/form-builder-config";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

type ErrorMap = Record<string, string>;

const STEP_TITLES = [
  {
    title: "Basic Info",
    description: "Form title & student fields",
    icon: School,
    color: "from-violet-500 to-purple-600",
    bg: "bg-violet-50",
    text: "text-violet-600",
    border: "border-violet-200",
  },
  {
    title: "Documents",
    description: "Required document uploads",
    icon: FileStack,
    color: "from-blue-500 to-cyan-600",
    bg: "bg-blue-50",
    text: "text-blue-600",
    border: "border-blue-200",
  },
  {
    title: "Publish",
    description: "Set fees & go live",
    icon: Sparkles,
    color: "from-emerald-500 to-teal-600",
    bg: "bg-emerald-50",
    text: "text-emerald-600",
    border: "border-emerald-200",
  },
];

const FIELD_ICONS: Record<string, any> = {
  text: FileText,
  email: Mail,
  tel: Phone,
  number: GraduationCap,
  date: Calendar,
  file: Upload,
  select: ChevronRight,
  textarea: FileText,
};

const FIELD_TYPE_COLORS: Record<string, string> = {
  text: "bg-slate-100 text-slate-600",
  email: "bg-purple-100 text-purple-600",
  tel: "bg-green-100 text-green-600",
  number: "bg-orange-100 text-orange-600",
  date: "bg-blue-100 text-blue-600",
  file: "bg-pink-100 text-pink-600",
  select: "bg-yellow-100 text-yellow-700",
  textarea: "bg-indigo-100 text-indigo-600",
};

function cloneField(field: ConfiguredField, index: number) {
  return {
    ...field,
    lockedRequired: field.required,
    id: `${field.key}-${index}-${Math.random().toString(36).slice(2, 8)}`,
    options: field.options.map((option) => ({ ...option })),
  };
}

function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

// Converts "2025-2026" → "2025-26" for payload
function shortYear(year: string) {
  const parts = year.split("-");
  if (parts.length === 2 && parts[1].length === 4) {
    return `${parts[0]}-${parts[1].slice(2)}`;
  }
  return year;
}

function createCustomField(
  section: "personal" | "documents",
  count: number,
): ConfiguredField {
  const key = `${section}_custom_${count + 1}`;
  return {
    id: `${key}-${Date.now()}`,
    key,
    label:
      section === "personal" ? "Additional Information" : "Additional Document",
    type: section === "documents" ? "file" : "text",
    required: section === "documents",
    placeholder: "",
    options: [],
    selected: true,
    custom: true,
    lockedType: section === "documents",
    lockedRequired: false,
  };
}

const STUDENT_FIELD_MAPPING: Record<string, string> = {
  student_full_name: "name",
  surname: "surname",
  father_name: "father_name",
  mother_name: "mother_name",
  date_of_birth: "date_of_birth",
  mobile_number: "mobile",
  applying_for_class: "school_class",
  division: "division",
};

function toPayloadFields(
  fields: ConfiguredField[],
): AdmissionFormFieldPayload[] {
  return fields
    .filter((field): field is ConfiguredField => field.selected)
    .map((field, index) => {
      const isSelect = field.type === "select";
      const validOptions = isSelect
        ? field.options.filter((option) => option.label && option.value)
        : [];
      return {
        label: field.label.trim(),
        field_type: field.type,
        required: field.required,
        is_required: field.required,
        order: index + 1,
        map_to_student_field: STUDENT_FIELD_MAPPING[field.key] || null,
        ...(field.key === "applying_for_class"
          ? {}
          : field.type === "select" && validOptions.length > 0
            ? { options: validOptions }
            : {}),
      };
    });
}

// ─── Field Card (redesigned) ────────────────────────────────────────────────
function FieldCard({
  field,
  onToggle,
  onChange,
  onRemove,
  section,
  classes,
  index: cardIndex,
}: {
  field: ConfiguredField;
  onToggle: (checked: boolean) => void;
  onChange: (nextField: ConfiguredField) => void;
  onRemove?: () => void;
  section?: "personal" | "documents";
  classes: SchoolClass[];
  index?: number;
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const IconComponent = FIELD_ICONS[field.type] || FileText;
  const isDocumentField = section === "documents";
  const typeColor = FIELD_TYPE_COLORS[field.type] || "bg-slate-100 text-slate-600";

  const setOptionValue = (
    optionIndex: number,
    nextKey: keyof BuilderOption,
    nextValue: string,
  ) => {
    const nextOptions = field.options.map((option, index) =>
      index === optionIndex ? { ...option, [nextKey]: nextValue } : option,
    );
    onChange({ ...field, options: nextOptions });
  };

  const addOption = () => {
    onChange({
      ...field,
      options: [...field.options, { label: "", value: "" }],
    });
  };

  const removeOption = (optionIndex: number) => {
    onChange({
      ...field,
      options: field.options.filter((_, index) => index !== optionIndex),
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8, scale: 0.97 }}
      transition={{ duration: 0.2, delay: (cardIndex ?? 0) * 0.03 }}
      layout
    >
      <div
        className={cn(
          "group relative rounded-xl border transition-all duration-200",
          field.selected
            ? "border-slate-200 bg-white shadow-sm shadow-slate-100"
            : "border-slate-300 bg-slate-50",

        )}
      >
        {/* Left accent bar when selected */}
        {field.selected && (
          <div className="absolute left-0 top-2 bottom-2 w-0.5 rounded-full bg-gradient-to-b from-violet-400 to-purple-500" />
        )}

        <div className="flex items-center gap-2.5 px-3 py-3 pl-4">
          {/* Checkbox */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div>
                  <Checkbox
                    checked={field.selected}
                    disabled={field.key === "applying_for_class" || field.lockedType}
                    onCheckedChange={(checked) => onToggle(Boolean(checked))}
                    className="h-4 w-4 rounded data-[state=checked]:bg-violet-600 data-[state=checked]:border-violet-600"
                  />
                </div>
              </TooltipTrigger>
              {field.key === "applying_for_class" && (
                <TooltipContent side="right" className="text-xs">
                  Mandatory field — cannot be deselected
                </TooltipContent>
              )}
            </Tooltip>
          </TooltipProvider>

          {/* Icon */}
          <div className={cn(
            "flex h-7 w-7 shrink-0 items-center justify-center rounded-lg",
            field.selected ? typeColor : "bg-slate-200 text-slate-600",

          )}>
            <IconComponent className="h-3.5 w-3.5" />
          </div>

          {/* Label & Meta */}
          <div className="flex-1 min-w-0 overflow-hidden">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className={cn(
                "text-sm font-semibold truncate leading-tight",
                field.selected ? "text-slate-800" : "text-slate-700",
              )}>
                {field.label}
              </span>
              {field.required && field.selected && (
                <span className="inline-flex items-center rounded-full bg-red-50 px-1.5 py-0.5 text-[10px] font-semibold text-red-500 border border-red-100 whitespace-nowrap">
                  Req
                </span>
              )}
              {field.custom && (
                <span className="inline-flex items-center rounded-full bg-amber-50 px-1.5 py-0.5 text-[10px] font-semibold text-amber-600 border border-amber-200 whitespace-nowrap">
                  Custom
                </span>
              )}
            </div>
            <p className={cn(
              "text-[11px] mt-0.5 font-mono truncate",
              field.selected ? "text-slate-700" : "text-slate-600",
            )}>
              {field.key} · {field.key === "applying_for_class" ? "text" : field.type}
            </p>
          </div>

          {/* Actions — always visible */}
          <div className="flex items-center gap-0.5 shrink-0">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className={cn(
                "flex h-7 w-7 items-center justify-center rounded-lg transition-colors",
                isExpanded
                  ? "bg-violet-100 text-violet-600"
                  : "text-slate-400 hover:bg-violet-50 hover:text-violet-500",
              )}
            >
              <Settings2 className="h-3.5 w-3.5" />
            </button>
            {onRemove && (
              <button
                onClick={onRemove}
                className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-300 hover:bg-red-50 hover:text-red-500 transition-colors"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Expanded config panel */}
        <AnimatePresence>
          {field.selected && isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="mx-2.5 mb-2.5 mt-1 rounded-lg border border-slate-100 bg-slate-50/80 p-3">
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Label</Label>
                    <Input
                      value={field.label}
                      onChange={(e) => onChange({ ...field, label: e.target.value })}
                      placeholder="Field Name"
                      className="h-9 rounded-lg border-slate-200 bg-white text-sm focus-visible:ring-violet-400"
                    />
                  </div>

                  {!isDocumentField && (
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Type</Label>
                      <select
                        className="flex h-9 w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm shadow-none outline-none focus:ring-2 focus:ring-violet-400 disabled:opacity-50"
                        value={field.key === "applying_for_class" ? "text" : field.type}
                        disabled={field.key === "applying_for_class"}
                        onChange={(e) =>
                          onChange({
                            ...field,
                            type: e.target.value as BuilderFieldType,
                            options:
                              e.target.value === "select" && !field.options.length
                                ? [{ label: "", value: "" }]
                                : field.options,
                          })
                        }
                      >
                        {FIELD_TYPE_OPTIONS.map((option, index) => (
                          <option key={option.value || `field-option-${index}`} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {!field.lockedRequired && !isDocumentField && (
                    <div className="col-span-full flex items-center justify-between rounded-lg border border-slate-200 bg-white px-3 py-2.5">

                      <div>
                        <p className="text-sm font-medium text-slate-700">Required field</p>
                        <p className="text-xs text-slate-400">Applicant must complete this</p>
                      </div>
                      <Switch
                        checked={field.required}
                        onCheckedChange={(checked) => onChange({ ...field, required: Boolean(checked) })}
                        className="data-[state=checked]:bg-violet-600"
                      />
                    </div>
                  )}
                </div>

                {field.type === "select" && field.key !== "applying_for_class" && (
                  <div className="mt-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Options</Label>
                      <Button type="button" variant="ghost" size="sm" onClick={addOption} className="h-7 text-xs text-violet-600 hover:bg-violet-50">
                        <Plus className="mr-1 h-3 w-3" /> Add
                      </Button>
                    </div>
                    {field.options.map((option, index) => (
                      <div key={`${option.value || "option"}-${index}`} className="flex gap-2">
                        <Input value={option.label} placeholder="Label" onChange={(e) => setOptionValue(index, "label", e.target.value)} className="h-8 rounded-lg text-sm" />
                        <Input value={option.value} placeholder="Value" onChange={(e) => setOptionValue(index, "value", e.target.value)} className="h-8 rounded-lg text-sm" />
                        <button onClick={() => removeOption(index)} className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg hover:bg-red-50 text-slate-300 hover:text-red-500 transition-colors">
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

type Section = {
  id: number;
  title: string;
  order: number;
  fields: ConfiguredField[];
};

// ─── Main Component ──────────────────────────────────────────────────────────
export default function PrincipalFormBuilder({
  onSuccess,
}: {
  onSuccess?: (form: AdmissionFormResponse) => void;
}) {
  const [currentStep, setCurrentStep] = useState(0);
  const [academicYear, setAcademicYear] = useState("2025-2026");
  const [title, setTitle] = useState("Student Admission Form");
  const [description, setDescription] = useState("");
  const [documentSectionTitle, setDocumentSectionTitle] = useState("Required Documents");

  const [sections, setSections] = useState<Section[]>([
    {
      id: Date.now(),
      title: "Student Information",
      order: 1,
      fields: PERSONAL_FIELD_TEMPLATES.map((field, index) => {
        const configuredField = createConfiguredField(field);
        if (configuredField.key === "applying_for_class") {
          configuredField.options = [];
        }
        return cloneField(configuredField, index);
      }),
    },
  ]);

  const [documentFields, setDocumentFields] = useState<ConfiguredField[]>(
    DOCUMENT_FIELD_TEMPLATES.map((field, index) => cloneField(createConfiguredField(field), index)),
  );

  const [feesEnabled, setFeesEnabled] = useState(false);
  const [paymentMode, setPaymentMode] = useState<"online" | "offline">("online");
  const [feeType, setFeeType] = useState<"general" | "individual">("general");
  const [feesAmount, setFeesAmount] = useState("");
  const [individualFees, setIndividualFees] = useState<Record<number, string>>({});
  const [errors, setErrors] = useState<ErrorMap>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [createdForm, setCreatedForm] = useState<AdmissionFormResponse | null>(null);
  const [classes, setClasses] = useState<SchoolClass[]>([]);

  useEffect(() => {
    async function fetchClasses() {
      try {
        const data = await getSchoolClasses();
        if (data && data.length > 0) {
          const sortedData = [...data].sort((a, b) => {
            const indexA = SCHOOL_CLASS_OPTIONS.findIndex((opt) => opt.value === a.school_class);
            const indexB = SCHOOL_CLASS_OPTIONS.findIndex((opt) => opt.value === b.school_class);
            if (indexA === -1) return 1;
            if (indexB === -1) return -1;
            return indexA - indexB;
          });
          setClasses(sortedData);
          setSections((prev) =>
            prev.map((section) => ({
              ...section,
              fields: section.fields.map((field) =>
                field.key === "applying_for_class"
                  ? { ...field, options: sortedData.map((cls) => ({ label: cls.school_class, value: String(cls.id) })) }
                  : field,
              ),
            })),
          );
          const initialFees: Record<number, string> = {};
          sortedData.forEach((cls) => { initialFees[cls.id] = ""; });
          setIndividualFees(initialFees);
        }
      } catch (err) {
        console.error("Failed to fetch classes:", err);
      }
    }
    fetchClasses();
  }, []);

  const payload = useMemo<AdmissionFormCreatePayload>(() => {
    const formattedSections = sections.map((section, index) => ({
      title: section.title.trim() || `Section ${index + 1}`,
      order: index + 1,
      fields: toPayloadFields(section.fields),
    }));
    const document_fields = documentFields.filter((field) => field.selected).map((field) => field.label.trim());
    const formTitle = `${title.trim()} ${shortYear(academicYear)}`.trim();
    return {
      fees_enable: feesEnabled,
      fees: feesEnabled && feeType === "general" ? Number(feesAmount) || 0 : null,
      title: formTitle,
      description: description.trim() || `Admission form for academic year ${shortYear(academicYear)}`,
      unique_link: slugify(formTitle),
      fee_type: feeType,
      payment_mode: feesEnabled ? paymentMode : null,
      sections: formattedSections,
      document_fields,
      fee_structures_input:
        feesEnabled && feeType === "individual"
          ? Object.entries(individualFees)
            .filter(([_, amt]) => amt && Number(amt) > 0)
            .map(([id, amt]) => ({ class_name: Number(id), fee_amount: Number(amt).toFixed(2) }))
          : [],
    };
  }, [academicYear, description, documentFields, feeType, feesAmount, feesEnabled, individualFees, sections, title]);

  const validateStep = (step: number) => {
    const nextErrors: ErrorMap = {};
    if (step === 0) {
      if (!title.trim()) nextErrors.title = "Form title is required";
      const hasFields = payload.sections.some((section) => section.fields.length > 0);
      if (!hasFields) nextErrors.personalFields = "At least one section field is required";
    }
    if (step === 2 && feesEnabled) {
      if (feeType === "general" && !feesAmount.trim()) {
        nextErrors.fees = "Application fee amount is required";
      } else if (feeType === "individual") {
        const hasAnyFee = Object.values(individualFees).some((amt) => amt && Number(amt) > 0);
        if (!hasAnyFee) nextErrors.fees = "Please set at least one class fee";
      }
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const nextStep = () => {
    if (!validateStep(currentStep)) return;
    setCurrentStep((value) => Math.min(value + 1, STEP_TITLES.length - 1));
  };

  const previousStep = () => {
    setErrors({});
    setCurrentStep((value) => Math.max(value - 1, 0));
  };

  const submitForm = async () => {
    if (!validateStep(2)) return;
    setIsSubmitting(true);
    setSubmitError("");
    try {
      const response = await createAdmissionForm(payload);
      setCreatedForm(response);
      onSuccess?.(response);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "Failed to create admission form");
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateFieldList = (updater: (fields: ConfiguredField[]) => ConfiguredField[]): void => {
    setDocumentFields((current: ConfiguredField[]) => updater(current));
  };

  const updateSectionFields = (sectionId: number, updater: (fields: ConfiguredField[]) => ConfiguredField[]) => {
    setSections((current) =>
      current.map((section) =>
        section.id === sectionId ? { ...section, fields: updater(section.fields) } : section,
      ),
    );
  };

  const sortFields = (fields: ConfiguredField[]) => {
    return [...fields].sort((a, b) => {
      if (a.key === "applying_for_class") return -1;
      if (b.key === "applying_for_class") return 1;
      return 0;
    });
  };

  const getSelectedCount = (fields: ConfiguredField[]) => fields.filter((f) => f.selected).length;

  const totalStudentFields = sections.reduce((total, section) => total + getSelectedCount(section.fields), 0);
  const totalDocFields = getSelectedCount(documentFields);

  return (
    <div className="min-h-screen bg-[#F7F7FA]">
      {/* ── Top Header ── */}
      <div className="border-b border-slate-200 bg-white px-3 py-3 sm:px-6 sm:py-4">
        <div className="mx-auto max-w-5xl">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-600 shadow-sm shadow-violet-200">
                <School className="h-4.5 w-4.5 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-1.5 text-xs text-slate-400">
                  <span>Admission Management</span>
                  <ChevronRight className="h-3 w-3" />
                  <span className="text-slate-600 font-medium">Form Builder</span>
                </div>
                <h1 className="text-base font-bold text-slate-900 leading-tight">Create Admission Form</h1>
              </div>
            </div>

            <select
              className="h-9 w-full sm:w-auto rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 shadow-sm outline-none focus:ring-2 focus:ring-violet-400"

              value={academicYear}
              onChange={(e: any) => setAcademicYear(e.target.value)}
            >
              <option value="2024-2025">2024 – 2025</option>
              <option value="2025-2026">2025 – 2026</option>
              <option value="2026-2027">2026 – 2027</option>
            </select>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-3 py-4 sm:px-4 sm:py-8">
        {/* ── Step Indicator ── */}
        <div className="mb-8 flex items-center gap-2 overflow-x-auto pb-1">

          {STEP_TITLES.map((step, index) => {
            const Icon = step.icon;
            const isActive = currentStep === index;
            const isDone = currentStep > index;

            return (
              <div key={step.title} className="flex items-center gap-2">
                <motion.div
                  animate={{
                    scale: isActive ? 1 : 0.95,
                    opacity: isDone || isActive ? 1 : 0.7,
                  }}
                  className={cn(
                    "flex items-center gap-2.5 rounded-2xl px-4 py-2.5 transition-colors shrink-0",

                    isActive && "bg-white border border-slate-200 shadow-sm",
                    isDone && "bg-emerald-50 border border-emerald-100",
                    !isActive && !isDone && "bg-transparent",
                  )}
                >
                  <div
                    className={cn(
                      "flex h-7 w-7 items-center justify-center rounded-xl",
                      isActive && `bg-gradient-to-br ${step.color} text-white shadow-sm`,
                      isDone && "bg-emerald-500 text-white",
                      !isActive && !isDone && "bg-slate-200 text-slate-400",
                    )}
                  >
                    {isDone ? <Check className="h-3.5 w-3.5" /> : <Icon className="h-3.5 w-3.5" />}
                  </div>
                  <div className="hidden sm:block">
                    <p className={cn("text-sm font-semibold leading-none", isActive ? "text-slate-900" : isDone ? "text-emerald-700" : "text-slate-400")}>
                      {step.title}
                    </p>
                    <p className={cn("text-[11px] mt-0.5", isActive ? "text-slate-400" : isDone ? "text-emerald-500" : "text-slate-300")}>
                      {step.description}
                    </p>
                  </div>
                </motion.div>

                {index < STEP_TITLES.length - 1 && (
                  <div className={cn("h-px flex-1 min-w-[24px] mx-1 rounded-full transition-colors", currentStep > index ? "bg-emerald-300" : "bg-slate-200")} />
                )}
              </div>
            );
          })}
        </div>

        {/* ── Main Panel ── */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.22, ease: "easeInOut" }}
          >
            {/* ──────────── STEP 0: Basic Info ──────────── */}
            {currentStep === 0 && (
              <div className="space-y-5">
                {/* Metadata card */}
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="mb-5">
                    <h2 className="text-base font-bold text-slate-900">Form Details</h2>
                    <p className="text-sm text-slate-400 mt-0.5">Set the form's identity before configuring fields</p>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Form Title</Label>
                      <Input
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="e.g., Class XI Admission"
                        className={cn(
                          "h-10 rounded-xl border-slate-200 bg-slate-50 text-sm focus-visible:ring-violet-400 focus-visible:bg-white transition-colors",
                          errors.title && "border-red-300 bg-red-50",
                        )}
                      />
                      {errors.title && <p className="text-xs text-red-500 flex items-center gap-1"><AlertCircle className="h-3 w-3" />{errors.title}</p>}
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Section Title</Label>
                      <Input
                        value={sections[0]?.title || ""}
                        onChange={(e) => {
                          const updated = [...sections];
                          updated[0].title = e.target.value;
                          setSections(updated);
                        }}
                        placeholder="e.g., Student Information"
                        className="h-10 rounded-xl border-slate-200 bg-slate-50 text-sm focus-visible:ring-violet-400 focus-visible:bg-white transition-colors"
                      />
                    </div>

                    <div className="space-y-1.5 sm:col-span-2">
                      <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Description <span className="normal-case font-normal text-slate-400">(optional)</span></Label>
                      <Textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Brief description about this admission form..."
                        className="resize-none rounded-xl border-slate-200 bg-slate-50 text-sm focus-visible:ring-violet-400 focus-visible:bg-white transition-colors"
                        rows={2}
                      />
                    </div>
                  </div>
                </div>

                {/* Sections */}
                {sections.map((section, sectionIndex) => (
                  <div key={section.id} className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                    {/* Section header */}
                    <div className="flex flex-col gap-2 border-b border-slate-100 bg-slate-50/60 px-3 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5 sm:py-3.5">
                      {/* Row 1 on mobile: icon + title + badge */}
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-violet-100">
                          <LayoutGrid className="h-3.5 w-3.5 text-violet-600" />
                        </div>
                        {sectionIndex === 0 ? (
                          <span className="text-sm font-semibold text-slate-700 truncate">{section.title || "Section 1"}</span>
                        ) : (
                          <Input
                            value={section.title}
                            onChange={(e) => {
                              const updated = [...sections];
                              updated[sectionIndex].title = e.target.value;
                              setSections(updated);
                            }}
                            placeholder="Section Title"
                            className="h-7 w-32 sm:w-40 rounded-lg border-slate-200 bg-white text-sm font-semibold focus-visible:ring-violet-400"
                          />
                        )}
                        <span className="shrink-0 rounded-full bg-violet-100 px-2 py-0.5 text-[11px] font-semibold text-violet-700 whitespace-nowrap">
                          {getSelectedCount(section.fields)}/{section.fields.length} selected
                        </span>
                      </div>

                      {/* Row 2 on mobile: Add Field button (left-aligned) */}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-fit gap-1.5 rounded-lg text-xs font-semibold text-violet-600 hover:bg-violet-50 sm:w-auto"
                        onClick={() =>
                          updateSectionFields(section.id, (fields) => [
                            ...fields,
                            createCustomField("personal", fields.filter((f) => f.custom).length),
                          ])
                        }
                      >
                        <Plus className="h-3.5 w-3.5" /> Add Field
                      </Button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-3">
                      <AnimatePresence initial={false}>
                        {sortFields(section.fields).map((field, fIndex) => (
                          <FieldCard
                            key={field.id}
                            field={field}
                            index={fIndex}
                            classes={classes}
                            section="personal"
                            onToggle={(checked) =>
                              updateSectionFields(section.id, (fields) =>
                                fields.map((item) =>
                                  item.id === field.id
                                    ? { ...item, selected: item.key === "applying_for_class" ? true : checked }
                                    : item,
                                ),
                              )
                            }
                            onChange={(nextField) =>
                              updateSectionFields(section.id, (fields) =>
                                fields.map((item) => (item.id === field.id ? nextField : item)),
                              )
                            }
                            onRemove={
                              field.custom
                                ? () =>
                                  updateSectionFields(section.id, (fields) =>
                                    fields.filter((item) => item.id !== field.id),
                                  )
                                : undefined
                            }
                          />
                        ))}
                      </AnimatePresence>
                    </div>
                  </div>
                ))}

                {/* Add Section */}
                <button
                  onClick={() => {
                    setSections((prev) => [
                      ...prev,
                      { id: Date.now(), title: `Section ${prev.length + 1}`, order: prev.length + 1, fields: [] },
                    ]);
                  }}
                  className="group flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-slate-200 bg-white py-4 text-sm font-semibold text-slate-400 transition-all hover:border-violet-300 hover:bg-violet-50/50 hover:text-violet-600"
                >
                  <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-slate-100 transition-colors group-hover:bg-violet-100 group-hover:text-violet-600">
                    <Plus className="h-3.5 w-3.5" />
                  </div>
                  Add New Section
                </button>
              </div>
            )}

            {/* ──────────── STEP 1: Documents ──────────── */}
            {currentStep === 1 && (
              <div className="space-y-5">
                <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                  <div className="flex flex-col gap-2 border-b border-slate-100 bg-slate-50/60 px-3 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5 sm:py-3.5">
                    {/* Row 1 on mobile: icon + title + badge */}
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-blue-100">
                        <FileStack className="h-3.5 w-3.5 text-blue-600" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-bold text-slate-700 truncate">Document Requirements</p>
                        <p className="hidden sm:block text-xs text-slate-400">Toggle which documents applicants must upload</p>
                      </div>
                      <span className="shrink-0 rounded-full bg-blue-100 px-2 py-0.5 text-[11px] font-semibold text-blue-700 whitespace-nowrap">
                        {getSelectedCount(documentFields)} selected
                      </span>
                    </div>

                    {/* Row 2 on mobile: Add Field button (left-aligned) */}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-fit gap-1.5 rounded-lg text-xs font-semibold text-blue-600 hover:bg-blue-50 sm:w-auto"
                      onClick={() =>
                        updateFieldList((fields) => [
                          ...fields,
                          createCustomField("documents", fields.filter((f) => f.custom).length),
                        ])
                      }
                    >
                      <Plus className="h-3.5 w-3.5" /> Add Field
                    </Button>
                  </div>

                  <div className="p-3">
                    <div className="mb-3 flex items-center gap-3">
                      <div className="space-y-1 flex-1 max-w-xs">
                        <Label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide">Section Title</Label>
                        <Input
                          value={documentSectionTitle}
                          onChange={(e) => setDocumentSectionTitle(e.target.value)}
                          className="h-8 rounded-lg border-slate-200 bg-slate-50 text-sm focus-visible:ring-blue-400 focus-visible:bg-white"
                        />
                      </div>
                    </div>

                    <ScrollArea className="h-[360px] sm:h-[480px] pr-1">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <AnimatePresence initial={false}>
                          {sortFields(documentFields).map((field, fIndex) => (
                            <FieldCard
                              key={field.id || `doc-${fIndex}`}
                              field={field}
                              index={fIndex}
                              section="documents"
                              classes={classes}
                              onToggle={(checked) =>
                                updateFieldList((fields) =>
                                  fields.map((item) => (item.id === field.id ? { ...item, selected: checked } : item)),
                                )
                              }
                              onChange={(nextField) =>
                                updateFieldList((fields) =>
                                  fields.map((item) =>
                                    item.id === field.id ? { ...nextField, type: "file", required: true } : item,
                                  ),
                                )
                              }
                              onRemove={
                                field.custom
                                  ? () => updateFieldList((fields) => fields.filter((item) => item.id !== field.id))
                                  : undefined
                              }
                            />
                          ))}
                        </AnimatePresence>
                      </div>
                    </ScrollArea>
                  </div>
                </div>
              </div>
            )}

            {/* ──────────── STEP 2: Review & Publish ──────────── */}
            {currentStep === 2 && (
              <div className="grid gap-5 lg:grid-cols-5">
                {/* Left: Fee config */}
                <div className="lg:col-span-3 space-y-4">
                  {/* Fee toggle */}
                  <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100">
                          <IndianRupee className="h-4.5 w-4.5 text-emerald-600" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-800">Application Fee</p>
                          <p className="text-xs text-slate-400">Charge applicants before submitting</p>
                        </div>
                      </div>
                      <Switch
                        checked={feesEnabled}
                        onCheckedChange={setFeesEnabled}
                        className="data-[state=checked]:bg-emerald-600"
                      />
                    </div>

                    <AnimatePresence>
                      {feesEnabled && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          <div className="mt-4 space-y-4">
                            {/* Fee type toggle */}
                            <div className="flex gap-2">
                              {(["general", "individual"] as const).map((t) => (
                                <button
                                  key={t}
                                  type="button"
                                  onClick={() => setFeeType(t)}
                                  className={cn(
                                    "flex-1 rounded-xl py-2 text-sm font-semibold transition-all border",
                                    feeType === t
                                      ? "bg-emerald-600 text-white border-emerald-600 shadow-sm"
                                      : "bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100",
                                  )}
                                >
                                  {t === "general" ? "General Fee" : "Per Class"}
                                </button>
                              ))}
                            </div>

                            {feeType === "general" ? (
                              <div className="space-y-1.5">
                                <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Amount (INR)</Label>
                                <div className="relative">
                                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-semibold">₹</span>
                                  <Input
                                    type="number"
                                    min="0"
                                    value={feesAmount}
                                    onChange={(e) => setFeesAmount(e.target.value)}
                                    placeholder="500"
                                    className={cn(
                                      "h-11 pl-8 rounded-xl border-slate-200 bg-slate-50 text-sm focus-visible:ring-emerald-400 focus-visible:bg-white",
                                      errors.fees && "border-red-300 bg-red-50",
                                    )}
                                  />
                                </div>
                                <p className="text-[11px] text-slate-400">Applies to all classes equally</p>
                                {errors.fees && <p className="text-xs text-red-500 flex items-center gap-1"><AlertCircle className="h-3 w-3" />{errors.fees}</p>}
                              </div>
                            ) : (
                              <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                  <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Class-wise Fees</Label>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const firstAmt = Object.values(individualFees).find((v) => v !== "") || "0";
                                      const next = { ...individualFees };
                                      classes.forEach((c) => (next[c.id] = firstAmt));
                                      setIndividualFees(next);
                                    }}
                                    className="flex items-center gap-1 rounded-lg bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-500 hover:bg-slate-200 transition-colors"
                                  >
                                    <Copy className="h-3 w-3" /> Apply first to all
                                  </button>
                                </div>
                                <ScrollArea className="h-52 rounded-xl border border-slate-200 bg-slate-50 p-3">
                                  <div className="space-y-2">
                                    {classes.map((cls, index) => (
                                      <div key={cls.id || `cls-${index}`} className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-3 py-2">
                                        <span className="text-sm font-semibold text-slate-700">{cls.school_class}</span>
                                        <div className="relative w-28">
                                          <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs">₹</span>
                                          <Input
                                            type="number"
                                            min="0"
                                            value={individualFees[cls.id] || ""}
                                            onChange={(e) => setIndividualFees((prev) => ({ ...prev, [cls.id]: e.target.value }))}
                                            className="h-8 pl-5 rounded-lg text-sm border-slate-200"
                                            placeholder="0"
                                          />
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </ScrollArea>
                                {errors.fees && <p className="text-xs text-red-500 flex items-center gap-1"><AlertCircle className="h-3 w-3" />{errors.fees}</p>}
                              </div>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Error / Success banners */}
                  <AnimatePresence>
                    {submitError && (
                      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                        <Alert variant="destructive" className="rounded-2xl">
                          <AlertCircle className="h-4 w-4" />
                          <AlertDescription>{submitError}</AlertDescription>
                        </Alert>
                      </motion.div>
                    )}

                    {createdForm && (
                      <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}>
                        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                            <p className="text-sm font-bold text-emerald-800">Form Published Successfully!</p>
                          </div>
                          <p className="text-xs text-emerald-700 mb-1">Form ID: <span className="font-mono font-semibold">{createdForm.id}</span></p>
                          <div className="flex items-center gap-2 rounded-lg bg-emerald-100 px-3 py-2">
                            <span className="text-xs text-emerald-600 font-mono break-all">{createdForm.unique_link}</span>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Right: Summary */}
                <div className="lg:col-span-2">
                  <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:sticky sm:top-4">
                    <div className="flex items-center gap-2 mb-4">
                      <BookOpen className="h-4 w-4 text-slate-400" />
                      <h3 className="text-sm font-bold text-slate-700">Form Summary</h3>
                    </div>

                    <div className="space-y-3">
                      {[
                        { label: "Academic Year", value: shortYear(academicYear) },
                        { label: "Student Fields", value: totalStudentFields },
                        { label: "Document Fields", value: totalDocFields },
                        { label: "Total Fields", value: totalStudentFields + totalDocFields, bold: true },
                        {
                          label: "Application Fee",
                          value: !feesEnabled ? "Free" : feeType === "individual" ? "Per Class" : `₹${feesAmount || "0"}`,
                          bold: true,
                        },
                      ].map(({ label, value, bold }) => (
                        <div key={label} className={cn("flex items-center justify-between", bold && "pt-2 border-t border-slate-100")}>
                          <span className="text-xs text-slate-400">{label}</span>
                          <span className={cn("text-sm font-semibold", bold ? "text-slate-900" : "text-slate-600")}>
                            {value}
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="mt-5 rounded-xl bg-gradient-to-br from-violet-50 to-purple-50 border border-violet-100 p-4">
                      <p className="text-[11px] font-semibold text-violet-700 uppercase tracking-wide mb-1">Form Link</p>
                      <p className="text-xs text-violet-500 font-mono break-all">
                        {slugify(`${title} ${shortYear(academicYear)}`) || "student-admission-form"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* ── Footer Nav ── */}
        <div className="mt-6 flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
          <Button
            variant="ghost"
            onClick={previousStep}
            disabled={currentStep === 0}
            className="h-10 gap-1.5 rounded-xl font-semibold text-slate-500 hover:text-slate-800 disabled:opacity-30"
          >
            <ChevronLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Back</span>
          </Button>

          <div className="flex items-center gap-2">
            {/* Dot indicators */}
            {STEP_TITLES.map((_, i) => (
              <div
                key={i}
                className={cn(
                  "rounded-full transition-all duration-300",
                  i === currentStep ? "h-2 w-6 bg-violet-600" : i < currentStep ? "h-2 w-2 bg-emerald-400" : "h-2 w-2 bg-slate-200",
                )}
              />
            ))}
          </div>

          {currentStep < STEP_TITLES.length - 1 ? (
            <Button
              onClick={nextStep}
              className="h-10 gap-1.5 rounded-xl bg-violet-600 px-4 sm:px-6 font-semibold text-white shadow-sm shadow-violet-200 hover:bg-violet-700 transition-all min-w-[110px]"
            >
              Continue
              <ArrowRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              onClick={submitForm}
              disabled={isSubmitting || !!createdForm}
              className="h-10 gap-1.5 rounded-xl bg-emerald-600 px-4 sm:px-6 font-semibold text-white shadow-sm shadow-emerald-200 hover:bg-emerald-700 disabled:opacity-60 transition-all min-w-[110px]"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Publishing...
                </>
              ) : createdForm ? (
                <>
                  <Check className="h-4 w-4" />
                  Published!
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  Publish Form
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
} 
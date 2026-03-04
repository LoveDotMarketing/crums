import { useState, useEffect } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { InspectionChecklist, ChecklistItem } from "@/components/mechanic/InspectionChecklist";
import { InspectionPhotoUpload } from "@/components/mechanic/InspectionPhotoUpload";
import { SignatureCapture } from "@/components/mechanic/SignatureCapture";
import { SEO } from "@/components/SEO";
import { ArrowLeft, ArrowRight, Check, Loader2, ClipboardCheck, AlertTriangle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";

const STEPS = [
  { id: 1, title: "Brakes & Air System" },
  { id: 2, title: "Tires & Wheels" },
  { id: 3, title: "Lights & Electrical" },
  { id: 4, title: "Frame & Structure" },
  { id: 5, title: "Doors & Landing Gear" },
  { id: 6, title: "Coupling & Kingpin" },
  { id: 7, title: "Reflective Tape & Markings" },
  { id: 8, title: "Final Sign-off" }
];

interface InspectionData {
  // Brakes
  brakes_operational: boolean;
  no_air_leaks: boolean;
  brake_chambers_secure: boolean;
  air_hoses_secure: boolean;
  brake_adjustment_confirmed: boolean;
  brakes_comments: string;
  // Tires
  tires_tread_depth: boolean;
  tires_no_damage: boolean;
  tires_inflation: boolean;
  lug_nuts_secure: boolean;
  rims_no_damage: boolean;
  tires_comments: string;
  // Lights
  brake_lights_operational: boolean;
  turn_signals_operational: boolean;
  marker_lights_operational: boolean;
  no_broken_lenses: boolean;
  lights_comments: string;
  // Frame
  frame_no_cracks: boolean;
  undercarriage_secure: boolean;
  floor_intact: boolean;
  sidewalls_roof_intact: boolean;
  no_sharp_edges: boolean;
  frame_comments: string;
  // Doors
  rear_doors_operational: boolean;
  hinges_locks_seals_intact: boolean;
  landing_gear_operational: boolean;
  crank_handle_secure: boolean;
  mud_flaps_present: boolean;
  doors_comments: string;
  // Coupling
  kingpin_secure: boolean;
  apron_intact: boolean;
  no_coupling_damage: boolean;
  coupling_comments: string;
  // Reflective
  dot_reflective_tape_present: boolean;
  conspicuity_markings_intact: boolean;
  trailer_id_visible: boolean;
  reflective_comments: string;
  // Signature
  inspector_signature: string | null;
  dot_release_confirmed: boolean;
}

const initialData: InspectionData = {
  brakes_operational: false,
  no_air_leaks: false,
  brake_chambers_secure: false,
  air_hoses_secure: false,
  brake_adjustment_confirmed: false,
  brakes_comments: "",
  tires_tread_depth: false,
  tires_no_damage: false,
  tires_inflation: false,
  lug_nuts_secure: false,
  rims_no_damage: false,
  tires_comments: "",
  brake_lights_operational: false,
  turn_signals_operational: false,
  marker_lights_operational: false,
  no_broken_lenses: false,
  lights_comments: "",
  frame_no_cracks: false,
  undercarriage_secure: false,
  floor_intact: false,
  sidewalls_roof_intact: false,
  no_sharp_edges: false,
  frame_comments: "",
  rear_doors_operational: false,
  hinges_locks_seals_intact: false,
  landing_gear_operational: false,
  crank_handle_secure: false,
  mud_flaps_present: false,
  doors_comments: "",
  kingpin_secure: false,
  apron_intact: false,
  no_coupling_damage: false,
  coupling_comments: "",
  dot_reflective_tape_present: false,
  conspicuity_markings_intact: false,
  trailer_id_visible: false,
  reflective_comments: "",
  inspector_signature: null,
  dot_release_confirmed: false
};

export default function DOTInspectionForm() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const trailerId = searchParams.get("trailerId");
  const releaseId = searchParams.get("releaseId");
  
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [inspectionId, setInspectionId] = useState<string | null>(null);
  const [inspectorName, setInspectorName] = useState<string>("");
  const [trailerInfo, setTrailerInfo] = useState<{
    trailer_number: string;
    vin: string | null;
    license_plate: string | null;
    type: string;
  } | null>(null);
  const [formData, setFormData] = useState<InspectionData>(initialData);
  const [photos, setPhotos] = useState<Record<string, { id: string; photo_url: string }[]>>({});
  const [showMissingPhotoDialog, setShowMissingPhotoDialog] = useState(false);

  useEffect(() => {
    if (!trailerId) {
      toast.error("No trailer selected");
      navigate("/dashboard/mechanic");
      return;
    }
    initializeInspection();
  }, [trailerId]);

  const initializeInspection = async () => {
    try {
      // Get trailer info
      const { data: trailer, error: trailerError } = await supabase
        .from("trailers")
        .select("trailer_number, vin, license_plate, type")
        .eq("id", trailerId)
        .single();

      if (trailerError) throw trailerError;
      setTrailerInfo(trailer);

      // Get inspector profile for name
      const { data: profile } = await supabase
        .from("profiles")
        .select("first_name, last_name, email")
        .eq("id", user?.id)
        .single();

      const fullName = profile?.first_name && profile?.last_name
        ? `${profile.first_name} ${profile.last_name}`
        : profile?.email || "Unknown";
      setInspectorName(fullName);

      // Check for existing in-progress inspection
      const { data: existingInspection } = await supabase
        .from("dot_inspections")
        .select("*")
        .eq("trailer_id", trailerId)
        .eq("inspector_id", user?.id)
        .eq("status", "in_progress")
        .maybeSingle();

      if (existingInspection) {
        setInspectionId(existingInspection.id);
        // Load existing data
        setFormData({
          brakes_operational: existingInspection.brakes_operational || false,
          no_air_leaks: existingInspection.no_air_leaks || false,
          brake_chambers_secure: existingInspection.brake_chambers_secure || false,
          air_hoses_secure: existingInspection.air_hoses_secure || false,
          brake_adjustment_confirmed: existingInspection.brake_adjustment_confirmed || false,
          brakes_comments: existingInspection.brakes_comments || "",
          tires_tread_depth: existingInspection.tires_tread_depth || false,
          tires_no_damage: existingInspection.tires_no_damage || false,
          tires_inflation: existingInspection.tires_inflation || false,
          lug_nuts_secure: existingInspection.lug_nuts_secure || false,
          rims_no_damage: existingInspection.rims_no_damage || false,
          tires_comments: existingInspection.tires_comments || "",
          brake_lights_operational: existingInspection.brake_lights_operational || false,
          turn_signals_operational: existingInspection.turn_signals_operational || false,
          marker_lights_operational: existingInspection.marker_lights_operational || false,
          no_broken_lenses: existingInspection.no_broken_lenses || false,
          lights_comments: existingInspection.lights_comments || "",
          frame_no_cracks: existingInspection.frame_no_cracks || false,
          undercarriage_secure: existingInspection.undercarriage_secure || false,
          floor_intact: existingInspection.floor_intact || false,
          sidewalls_roof_intact: existingInspection.sidewalls_roof_intact || false,
          no_sharp_edges: existingInspection.no_sharp_edges || false,
          frame_comments: existingInspection.frame_comments || "",
          rear_doors_operational: existingInspection.rear_doors_operational || false,
          hinges_locks_seals_intact: existingInspection.hinges_locks_seals_intact || false,
          landing_gear_operational: existingInspection.landing_gear_operational || false,
          crank_handle_secure: existingInspection.crank_handle_secure || false,
          mud_flaps_present: existingInspection.mud_flaps_present || false,
          doors_comments: existingInspection.doors_comments || "",
          kingpin_secure: existingInspection.kingpin_secure || false,
          apron_intact: existingInspection.apron_intact || false,
          no_coupling_damage: existingInspection.no_coupling_damage || false,
          coupling_comments: existingInspection.coupling_comments || "",
          dot_reflective_tape_present: existingInspection.dot_reflective_tape_present || false,
          conspicuity_markings_intact: existingInspection.conspicuity_markings_intact || false,
          trailer_id_visible: (existingInspection as any).trailer_id_visible || false,
          reflective_comments: existingInspection.reflective_comments || "",
          inspector_signature: existingInspection.inspector_signature,
          dot_release_confirmed: existingInspection.dot_release_confirmed || false
        });

        // Load photos
        const { data: photosData } = await supabase
          .from("dot_inspection_photos")
          .select("id, category, photo_url")
          .eq("inspection_id", existingInspection.id);

        if (photosData) {
          const groupedPhotos: Record<string, { id: string; photo_url: string }[]> = {};
          photosData.forEach(photo => {
            if (!groupedPhotos[photo.category]) {
              groupedPhotos[photo.category] = [];
            }
            groupedPhotos[photo.category].push({ id: photo.id, photo_url: photo.photo_url });
          });
          setPhotos(groupedPhotos);
        }
      } else {
        // Create new inspection with inspector name and release request link
        const { data: newInspection, error: createError } = await supabase
          .from("dot_inspections")
          .insert({
            trailer_id: trailerId,
            inspector_id: user?.id,
            inspector_name: fullName,
            trailer_number: trailer.trailer_number,
            vin: trailer.vin,
            license_plate: trailer.license_plate,
            trailer_type: trailer.type,
            status: "in_progress",
            release_request_id: releaseId || null
          })
          .select()
          .single();

        if (createError) throw createError;
        setInspectionId(newInspection.id);

        // Update trailer status to maintenance
        await supabase
          .from("trailers")
          .update({ status: "maintenance" })
          .eq("id", trailerId);

        // If there's a release request, update its status
        if (releaseId) {
          await supabase
            .from("trailer_release_requests")
            .update({
              status: "inspection_in_progress",
              dot_inspection_id: newInspection.id
            })
            .eq("id", releaseId);
        }
      }
    } catch (error) {
      console.error("Error initializing inspection:", error);
      toast.error("Failed to start inspection");
      navigate("/dashboard/mechanic");
    } finally {
      setLoading(false);
    }
  };

  const saveProgress = async () => {
    if (!inspectionId) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from("dot_inspections")
        .update(formData)
        .eq("id", inspectionId);

      if (error) throw error;
    } catch (error) {
      console.error("Error saving progress:", error);
      toast.error("Failed to save progress");
    } finally {
      setSaving(false);
    }
  };

  const handleNext = async () => {
    await saveProgress();
    if (currentStep < STEPS.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = async () => {
    if (!formData.dot_release_confirmed || !formData.inspector_signature) {
      toast.error("Please complete all required fields and sign the inspection");
      return;
    }

    // Warn if license plate photo is missing, but allow proceeding
    const hasLicensePlatePhoto = photos.license_plate && photos.license_plate.length > 0;
    if (!hasLicensePlatePhoto) {
      setShowMissingPhotoDialog(true);
      return;
    }

    await submitInspection();
  };

  const submitInspection = async () => {
    setShowMissingPhotoDialog(false);
    setSaving(true);
    try {
      // Update inspection status
      const { error } = await supabase
        .from("dot_inspections")
        .update({
          ...formData,
          status: "completed"
        })
        .eq("id", inspectionId);

      if (error) throw error;

      // Update trailer status to available (DOT ready)
      await supabase
        .from("trailers")
        .update({ status: "available" })
        .eq("id", trailerId);

      // If there's a release request, update its status to ready
      if (releaseId) {
        await supabase
          .from("trailer_release_requests")
          .update({ status: "ready" })
          .eq("id", releaseId);
      }

      toast.success("DOT Inspection completed! Trailer is now DOT-ready.");
      navigate("/dashboard/mechanic");
    } catch (error) {
      console.error("Error completing inspection:", error);
      toast.error("Failed to complete inspection");
    } finally {
      setSaving(false);
    }
  };

  const updateField = (field: keyof InspectionData, value: boolean | string | null) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handlePhotoUploaded = (category: string, url: string) => {
    setPhotos(prev => ({
      ...prev,
      [category]: [...(prev[category] || []), { id: url, photo_url: url }]
    }));
  };

  const handlePhotoDeleted = (category: string, id: string) => {
    setPhotos(prev => ({
      ...prev,
      [category]: prev[category]?.filter(p => p.id !== id) || []
    }));
  };

  const progress = (currentStep / STEPS.length) * 100;

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <>
      <SEO title="DOT Inspection" description="Complete DOT trailer inspection checklist" noindex />
      
      <div className="min-h-screen bg-background">
        <header className="border-b bg-card sticky top-0 z-10">
          <div className="container mx-auto px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard/mechanic")}>
                  <ArrowLeft className="h-5 w-5" />
                </Button>
                <div>
                  <h1 className="text-lg font-semibold">DOT Inspection</h1>
                  <p className="text-sm text-muted-foreground">
                    Trailer #{trailerInfo?.trailer_number} • {trailerInfo?.type}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium">Step {currentStep} of {STEPS.length}</p>
                <p className="text-xs text-muted-foreground">{STEPS[currentStep - 1].title}</p>
                {inspectorName && (
                  <p className="text-xs text-muted-foreground mt-1">Inspector: {inspectorName}</p>
                )}
              </div>
            </div>
            <Progress value={progress} className="mt-3 h-2" />
          </div>
        </header>

        <main className="container mx-auto px-4 py-6 max-w-2xl">
          {/* Step 1: Brakes & Air System */}
          {currentStep === 1 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ClipboardCheck className="h-5 w-5" />
                  Brakes & Air System
                </CardTitle>
                <CardDescription>
                  Inspect all brake components and air system integrity
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <InspectionChecklist
                  title="Brake Inspection"
                  items={[
                    { id: "brakes_operational", label: "All brakes operational", checked: formData.brakes_operational },
                    { id: "no_air_leaks", label: "No air leaks", checked: formData.no_air_leaks },
                    { id: "brake_chambers_secure", label: "All brake chambers secure", checked: formData.brake_chambers_secure },
                    { id: "air_hoses_secure", label: "Air hoses/lines intact and secure", checked: formData.air_hoses_secure },
                    { id: "brake_adjustment_confirmed", label: "Brake adjustment within spec", checked: formData.brake_adjustment_confirmed }
                  ]}
                  comments={formData.brakes_comments}
                  onItemChange={(id, checked) => updateField(id as keyof InspectionData, checked)}
                  onCommentsChange={(comments) => updateField("brakes_comments", comments)}
                />
                
                {inspectionId && (
                  <InspectionPhotoUpload
                    inspectionId={inspectionId}
                    category="brakes"
                    label="Brake System Photos"
                    existingPhotos={photos.brakes}
                    onPhotoUploaded={(url) => handlePhotoUploaded("brakes", url)}
                    onPhotoDeleted={(id) => handlePhotoDeleted("brakes", id)}
                  />
                )}
              </CardContent>
            </Card>
          )}

          {/* Step 2: Tires & Wheels */}
          {currentStep === 2 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ClipboardCheck className="h-5 w-5" />
                  Tires & Wheels
                </CardTitle>
                <CardDescription>
                  Check tire condition, tread depth, and wheel components
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <InspectionChecklist
                  title="Tire & Wheel Inspection"
                  items={[
                    { id: "tires_tread_depth", label: "Tread depth ≥ 4/32\"", checked: formData.tires_tread_depth },
                    { id: "tires_no_damage", label: "No cuts, bulges, or damage", checked: formData.tires_no_damage },
                    { id: "tires_inflation", label: "Proper inflation (all tires)", checked: formData.tires_inflation },
                    { id: "lug_nuts_secure", label: "All lug nuts secure", checked: formData.lug_nuts_secure },
                    { id: "rims_no_damage", label: "No rim cracks or damage", checked: formData.rims_no_damage }
                  ]}
                  comments={formData.tires_comments}
                  onItemChange={(id, checked) => updateField(id as keyof InspectionData, checked)}
                  onCommentsChange={(comments) => updateField("tires_comments", comments)}
                />
                
                {inspectionId && (
                  <div className="grid gap-4 sm:grid-cols-2">
                    <InspectionPhotoUpload
                      inspectionId={inspectionId}
                      category="tires_left"
                      label="Left Side Tires"
                      existingPhotos={photos.tires_left}
                      onPhotoUploaded={(url) => handlePhotoUploaded("tires_left", url)}
                      onPhotoDeleted={(id) => handlePhotoDeleted("tires_left", id)}
                    />
                    <InspectionPhotoUpload
                      inspectionId={inspectionId}
                      category="tires_right"
                      label="Right Side Tires"
                      existingPhotos={photos.tires_right}
                      onPhotoUploaded={(url) => handlePhotoUploaded("tires_right", url)}
                      onPhotoDeleted={(id) => handlePhotoDeleted("tires_right", id)}
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Step 3: Lights & Electrical */}
          {currentStep === 3 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ClipboardCheck className="h-5 w-5" />
                  Lights & Electrical
                </CardTitle>
                <CardDescription>
                  Verify all lighting and electrical systems function properly
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <InspectionChecklist
                  title="Lighting Inspection"
                  items={[
                    { id: "brake_lights_operational", label: "Brake lights operational", checked: formData.brake_lights_operational },
                    { id: "turn_signals_operational", label: "Turn signals operational", checked: formData.turn_signals_operational },
                    { id: "marker_lights_operational", label: "All marker/clearance lights operational", checked: formData.marker_lights_operational },
                    { id: "no_broken_lenses", label: "No broken or missing lenses", checked: formData.no_broken_lenses }
                  ]}
                  comments={formData.lights_comments}
                  onItemChange={(id, checked) => updateField(id as keyof InspectionData, checked)}
                  onCommentsChange={(comments) => updateField("lights_comments", comments)}
                />
                
                {inspectionId && (
                  <InspectionPhotoUpload
                    inspectionId={inspectionId}
                    category="lights"
                    label="Lighting Photos"
                    existingPhotos={photos.lights}
                    onPhotoUploaded={(url) => handlePhotoUploaded("lights", url)}
                    onPhotoDeleted={(id) => handlePhotoDeleted("lights", id)}
                  />
                )}
              </CardContent>
            </Card>
          )}

          {/* Step 4: Frame & Structure */}
          {currentStep === 4 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ClipboardCheck className="h-5 w-5" />
                  Frame, Body & Structural
                </CardTitle>
                <CardDescription>
                  Inspect frame integrity and body condition
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <InspectionChecklist
                  title="Frame & Body Inspection"
                  items={[
                    { id: "frame_no_cracks", label: "No frame cracks or bends", checked: formData.frame_no_cracks },
                    { id: "undercarriage_secure", label: "Undercarriage components secure", checked: formData.undercarriage_secure },
                    { id: "floor_intact", label: "Floor intact (no holes/rot)", checked: formData.floor_intact },
                    { id: "sidewalls_roof_intact", label: "Sidewalls and roof intact", checked: formData.sidewalls_roof_intact },
                    { id: "no_sharp_edges", label: "No sharp edges/protruding objects", checked: formData.no_sharp_edges }
                  ]}
                  comments={formData.frame_comments}
                  onItemChange={(id, checked) => updateField(id as keyof InspectionData, checked)}
                  onCommentsChange={(comments) => updateField("frame_comments", comments)}
                />
                
                {inspectionId && (
                  <InspectionPhotoUpload
                    inspectionId={inspectionId}
                    category="frame"
                    label="Frame & Structure Photos"
                    existingPhotos={photos.frame}
                    onPhotoUploaded={(url) => handlePhotoUploaded("frame", url)}
                    onPhotoDeleted={(id) => handlePhotoDeleted("frame", id)}
                  />
                )}
              </CardContent>
            </Card>
          )}

          {/* Step 5: Doors & Landing Gear */}
          {currentStep === 5 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ClipboardCheck className="h-5 w-5" />
                  Doors, Landing Gear & Securement
                </CardTitle>
                <CardDescription>
                  Check door operation and landing gear functionality
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <InspectionChecklist
                  title="Doors & Landing Gear Inspection"
                  items={[
                    { id: "rear_doors_operational", label: "Rear doors open/close/latch properly", checked: formData.rear_doors_operational },
                    { id: "hinges_locks_seals_intact", label: "Hinges, locks, and seals intact", checked: formData.hinges_locks_seals_intact },
                    { id: "landing_gear_operational", label: "Landing gear crank/raise/lower properly", checked: formData.landing_gear_operational },
                    { id: "crank_handle_secure", label: "Crank handle secure", checked: formData.crank_handle_secure },
                    { id: "mud_flaps_present", label: "Mud flaps present and secure", checked: formData.mud_flaps_present }
                  ]}
                  comments={formData.doors_comments}
                  onItemChange={(id, checked) => updateField(id as keyof InspectionData, checked)}
                  onCommentsChange={(comments) => updateField("doors_comments", comments)}
                />
                
                {inspectionId && (
                  <div className="grid gap-4 sm:grid-cols-2">
                    <InspectionPhotoUpload
                      inspectionId={inspectionId}
                      category="doors"
                      label="Door Photos"
                      existingPhotos={photos.doors}
                      onPhotoUploaded={(url) => handlePhotoUploaded("doors", url)}
                      onPhotoDeleted={(id) => handlePhotoDeleted("doors", id)}
                    />
                    <InspectionPhotoUpload
                      inspectionId={inspectionId}
                      category="landing_gear"
                      label="Landing Gear Photos"
                      existingPhotos={photos.landing_gear}
                      onPhotoUploaded={(url) => handlePhotoUploaded("landing_gear", url)}
                      onPhotoDeleted={(id) => handlePhotoDeleted("landing_gear", id)}
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Step 6: Coupling & Kingpin */}
          {currentStep === 6 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ClipboardCheck className="h-5 w-5" />
                  Coupling & Kingpin
                </CardTitle>
                <CardDescription>
                  Inspect kingpin and coupling assembly
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <InspectionChecklist
                  title="Coupling Inspection"
                  items={[
                    { id: "kingpin_secure", label: "Kingpin secure and undamaged", checked: formData.kingpin_secure },
                    { id: "apron_intact", label: "Upper coupler (apron) intact", checked: formData.apron_intact },
                    { id: "no_coupling_damage", label: "No cracks or damage to coupling area", checked: formData.no_coupling_damage }
                  ]}
                  comments={formData.coupling_comments}
                  onItemChange={(id, checked) => updateField(id as keyof InspectionData, checked)}
                  onCommentsChange={(comments) => updateField("coupling_comments", comments)}
                />
                
                {inspectionId && (
                  <InspectionPhotoUpload
                    inspectionId={inspectionId}
                    category="coupling"
                    label="Kingpin/Coupling Photos"
                    existingPhotos={photos.coupling}
                    onPhotoUploaded={(url) => handlePhotoUploaded("coupling", url)}
                    onPhotoDeleted={(id) => handlePhotoDeleted("coupling", id)}
                  />
                )}
              </CardContent>
            </Card>
          )}

          {/* Step 7: Reflective Tape & Markings */}
          {currentStep === 7 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ClipboardCheck className="h-5 w-5" />
                  Reflective Tape & Safety Markings
                </CardTitle>
                <CardDescription>
                  Verify DOT-required reflective markings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <InspectionChecklist
                  title="Reflective Marking Inspection"
                  items={[
                    { id: "dot_reflective_tape_present", label: "DOT reflective tape present (sides/rear)", checked: formData.dot_reflective_tape_present },
                    { id: "conspicuity_markings_intact", label: "Conspicuity markings intact and visible", checked: formData.conspicuity_markings_intact },
                    { id: "trailer_id_visible", label: "Trailer identification clearly visible", checked: formData.trailer_id_visible }
                  ]}
                  comments={formData.reflective_comments}
                  onItemChange={(id, checked) => updateField(id as keyof InspectionData, checked)}
                  onCommentsChange={(comments) => updateField("reflective_comments", comments)}
                />
                
                {inspectionId && (
                  <InspectionPhotoUpload
                    inspectionId={inspectionId}
                    category="reflective"
                    label="Reflective Tape Photos"
                    existingPhotos={photos.reflective}
                    onPhotoUploaded={(url) => handlePhotoUploaded("reflective", url)}
                    onPhotoDeleted={(id) => handlePhotoDeleted("reflective", id)}
                  />
                )}
              </CardContent>
            </Card>
          )}

          {/* Step 8: Final Sign-off */}
          {currentStep === 8 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Check className="h-5 w-5" />
                  Final DOT Release Acknowledgment
                </CardTitle>
                <CardDescription>
                  Review and sign to complete the inspection
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Warning banner if no license plate photo yet */}
                {!(photos.license_plate && photos.license_plate.length > 0) && (
                  <div className="flex items-center gap-2 p-3 rounded-lg border border-yellow-500/50 bg-yellow-500/10 text-yellow-700 dark:text-yellow-400">
                    <AlertTriangle className="h-5 w-5 shrink-0" />
                    <p className="text-sm">License plate photo is missing. You can still complete the inspection, but it is strongly recommended.</p>
                  </div>
                )}
                <div className="p-4 border rounded-lg bg-muted/50">
                  <h4 className="font-medium mb-2">Trailer Information</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-muted-foreground">Trailer #:</span>{" "}
                      <span className="font-medium">{trailerInfo?.trailer_number}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Type:</span>{" "}
                      <span className="font-medium">{trailerInfo?.type}</span>
                    </div>
                    {trailerInfo?.vin && (
                      <div>
                        <span className="text-muted-foreground">VIN:</span>{" "}
                        <span className="font-medium">{trailerInfo.vin}</span>
                      </div>
                    )}
                    {trailerInfo?.license_plate && (
                      <div>
                        <span className="text-muted-foreground">Plate:</span>{" "}
                        <span className="font-medium">{trailerInfo.license_plate}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-start gap-3 p-4 border rounded-lg">
                    <Checkbox
                      id="dot_release_confirmed"
                      checked={formData.dot_release_confirmed}
                      onCheckedChange={(checked) => updateField("dot_release_confirmed", checked === true)}
                    />
                    <Label htmlFor="dot_release_confirmed" className="text-sm leading-relaxed cursor-pointer">
                      I certify that I have personally inspected this trailer and all items on this checklist 
                      have been examined. This trailer meets all applicable DOT safety requirements and is 
                      safe for operation on public highways.
                    </Label>
                  </div>

                  <SignatureCapture
                    label="Inspector Signature *"
                    existingSignature={formData.inspector_signature || undefined}
                    onSignatureChange={(signature) => updateField("inspector_signature", signature)}
                  />
                </div>

                {inspectionId && (
                  <InspectionPhotoUpload
                    inspectionId={inspectionId}
                    category="license_plate"
                    label="License Plate Photo (Recommended)"
                    existingPhotos={photos.license_plate}
                    onPhotoUploaded={(url) => handlePhotoUploaded("license_plate", url)}
                    onPhotoDeleted={(id) => handlePhotoDeleted("license_plate", id)}
                    required
                  />
                )}
              </CardContent>
            </Card>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-6">
            <Button
              variant="outline"
              onClick={handlePrev}
              disabled={currentStep === 1}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Previous
            </Button>

            {currentStep < STEPS.length ? (
              <Button onClick={handleNext} disabled={saving}>
                {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                Next
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <Button onClick={handleComplete} disabled={saving} className="bg-green-600 hover:bg-green-700">
                {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Check className="h-4 w-4 mr-2" />}
                Complete Inspection
              </Button>
            )}
          </div>
        </main>

        {/* Missing license plate photo confirmation dialog */}
        <Dialog open={showMissingPhotoDialog} onOpenChange={setShowMissingPhotoDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-yellow-500" />
                License Plate Photo Missing
              </DialogTitle>
              <DialogDescription>
                No license plate photo has been uploaded for this inspection. It is strongly recommended to include one. Do you want to continue without it?
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={() => setShowMissingPhotoDialog(false)}>
                Go Back & Add Photo
              </Button>
              <Button variant="destructive" onClick={submitInspection} disabled={saving}>
                {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                Complete Without Photo
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
}

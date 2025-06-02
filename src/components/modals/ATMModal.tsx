import { useEffect } from "react";

import { useAtmById, useCreateATM, useUpdateATM } from "@/features/atms/hooks";
import { ATMCreate, ATMRegion, ATMStatus, ATMUpdate, atmCreateSchema, atmStatusEnum, atmUpdateSchema, regionEnum } from "@/features/atms/schema";
import { useNotification } from "@/hooks/use-notification";
import { zodResolver } from "@hookform/resolvers/zod";
import { Save } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface ATMModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "add" | "edit";
  atmId?: string | null;
}

export function ATMModal({ open, onOpenChange, mode, atmId }: ATMModalProps) {
  const { notification } = useNotification();

  const isEditMode = mode === "edit";

  // React Query hooks
  const { data: atmData, isLoading: isLoadingATM } = useAtmById(atmId || "");
  const createMutation = useCreateATM();
  const updateMutation = useUpdateATM();

  // Form setup with conditional schema
  const form = useForm<ATMCreate | ATMUpdate>({
    resolver: zodResolver(isEditMode ? atmUpdateSchema : atmCreateSchema),
    defaultValues: isEditMode
      ? {
          name: "",
          location_address: "",
          region: "AIRPORT" as ATMRegion,
          model: "",
          manufacturer: "",
          status: "active" as ATMStatus,
        }
      : {
          atm_id: "",
          name: "",
          location_address: "",
          region: "AIRPORT" as ATMRegion,
          model: "",
          manufacturer: "",
          status: "active" as ATMStatus,
        },
  });

  // Load ATM data for edit mode
  useEffect(() => {
    if (isEditMode && open && atmData) {
      form.reset({
        name: atmData.name,
        location_address: atmData.location_address || "",
        region: atmData.region,
        model: atmData.model || "",
        manufacturer: atmData.manufacturer || "",
        status: atmData.status,
      });
    } else {
      form.reset({
        name: "",
        location_address: "",
        region: "AIRPORT" as ATMRegion,
        model: "",
        manufacturer: "",
        status: "active" as ATMStatus,
      });
    }
  }, [isEditMode, atmData, open, form]);

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  const onSubmit = async (data: ATMCreate | ATMUpdate) => {
    try {
      if (isEditMode && atmId) {
        await updateMutation.mutateAsync({
          atmId,
          data: data as ATMUpdate,
        });
        toast.success("ATM updated successfully");
      } else {
        await createMutation.mutateAsync(data as ATMCreate);
        toast.success("ATM added successfully");
      }
      onOpenChange(false);
    } catch (error: any) {
      const errorMessage = isEditMode ? "Failed to update ATM. Please try again." : "Failed to add ATM. Please try again.";
      notification({
        title: "Error",
        description: error?.message || errorMessage,
        variant: "destructive",
      });
    }
  };

  const submitText = isEditMode ? "Update ATM" : "Add ATM";
  const submittingText = isEditMode ? "Updating..." : "Adding...";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditMode ? "Edit ATM" : "Add New ATM"}</DialogTitle>
          <DialogDescription>
            {isEditMode
              ? `Update ATM information for ${atmData?.atm_id || atmId}. Modify the fields as needed.`
              : "Add a new ATM to your network registry. Fill in all required fields."}
          </DialogDescription>
        </DialogHeader>
        {isEditMode && isLoadingATM ? (
          <div className="flex items-center justify-center py-4">
            <div className="text-muted-foreground">Loading ATM data...</div>
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                {!isEditMode && (
                  <FormField
                    control={form.control}
                    name="atm_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>ATM ID *</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., ATM001" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem className={isEditMode ? "md:col-span-2" : ""}>
                      <FormLabel>Name *</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Downtown Branch ATM" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="location_address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location Address</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., 123 Main Street, Downtown, City Center" {...field} value={field.value || ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="region"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Region *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a region" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {regionEnum.options.map((region) => (
                          <SelectItem key={region} value={region}>
                            {region.charAt(0).toUpperCase() + region.slice(1).toLowerCase()}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="model"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Model</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., NCR SelfServ 34" {...field} value={field.value || ""} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="manufacturer"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Manufacturer</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., NCR Corporation" {...field} value={field.value || ""} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {atmStatusEnum.options.map((status) => (
                          <SelectItem key={status} value={status}>
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter className="gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting || (isEditMode && isLoadingATM)}>
                  <Save className="h-4 w-4" />
                  {isSubmitting ? submittingText : submitText}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
}

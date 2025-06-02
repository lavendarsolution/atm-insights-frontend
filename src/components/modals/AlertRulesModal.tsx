import { useEffect, useState } from "react";

import { AlertTriangle, Bell, Clock, HardDrive, Network, Settings, Shield, Users, X } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

interface AlertRule {
  rule_type: string;
  name: string;
  description: string;
  severity: "critical" | "high" | "medium" | "low";
  threshold: number;
  condition_description: string;
  is_active: boolean;
  notification_channels: string[];
  cooldown_minutes: number;
  target_atms?: string[];
}

interface AlertRulesModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ruleIcons = {
  LOW_CASH: Bell,
  HIGH_TRANSACTION_FAILURES: AlertTriangle,
  NETWORK_ISSUES: Network,
  HARDWARE_MALFUNCTION: HardDrive,
  MAINTENANCE_DUE: Settings,
  UNUSUAL_ACTIVITY: Shield,
};

const severityColors = {
  critical: "destructive",
  high: "destructive",
  medium: "secondary",
  low: "outline",
} as const;

const getSeverityBadge = (severity: string) => {
  return <Badge variant={severityColors[severity as keyof typeof severityColors] || "outline"}>{severity.toUpperCase()}</Badge>;
};

export default function AlertRulesModal({ open, onOpenChange }: AlertRulesModalProps) {
  const [alertRules, setAlertRules] = useState<AlertRule[]>([]);
  const [loading, setLoading] = useState(true);

  // Mock data for pre-defined alert rules
  const mockAlertRules: AlertRule[] = [
    {
      rule_type: "LOW_CASH",
      name: "Low Cash Level",
      description: "Alert when ATM cash level falls below threshold",
      severity: "high",
      threshold: 20.0,
      condition_description: "Cash level below 20% of capacity",
      is_active: true,
      notification_channels: ["email", "telegram"],
      cooldown_minutes: 60,
    },
    {
      rule_type: "HIGH_TRANSACTION_FAILURES",
      name: "High Transaction Failure Rate",
      description: "Alert when transaction failure rate exceeds threshold",
      severity: "medium",
      threshold: 10.0,
      condition_description: "Transaction failure rate above 10%",
      is_active: true,
      notification_channels: ["email"],
      cooldown_minutes: 30,
    },
    {
      rule_type: "NETWORK_ISSUES",
      name: "Network Connectivity Issues",
      description: "Alert when ATM experiences network connectivity problems",
      severity: "high",
      threshold: 3.0,
      condition_description: "Network connection failures detected",
      is_active: true,
      notification_channels: ["email", "telegram"],
      cooldown_minutes: 15,
    },
    {
      rule_type: "HARDWARE_MALFUNCTION",
      name: "Hardware Malfunction",
      description: "Alert when hardware components are malfunctioning",
      severity: "critical",
      threshold: 1.0,
      condition_description: "Hardware component malfunction detected",
      is_active: true,
      notification_channels: ["email", "telegram"],
      cooldown_minutes: 5,
    },
    {
      rule_type: "MAINTENANCE_DUE",
      name: "Maintenance Due",
      description: "Alert when ATM maintenance is due or overdue",
      severity: "medium",
      threshold: 0.0,
      condition_description: "Scheduled maintenance is due",
      is_active: true,
      notification_channels: ["email"],
      cooldown_minutes: 1440,
    },
    {
      rule_type: "UNUSUAL_ACTIVITY",
      name: "Unusual Activity Detected",
      description: "Alert when unusual transaction patterns are detected",
      severity: "medium",
      threshold: 2.0,
      condition_description: "Transaction patterns deviate significantly from normal",
      is_active: true,
      notification_channels: ["email"],
      cooldown_minutes: 120,
    },
  ];

  useEffect(() => {
    if (open) {
      setLoading(true);
      // Simulate API call
      setTimeout(() => {
        setAlertRules(mockAlertRules);
        setLoading(false);
      }, 1000);
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-4xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Pre-defined Alert Rules
          </DialogTitle>
          <DialogDescription>View and understand the built-in alert rules that monitor your ATM network for critical conditions.</DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[70vh] pr-4">
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="text-muted-foreground">Loading alert rules...</div>
            </div>
          ) : (
            <div className="space-y-4">
              {alertRules.map((rule) => {
                const Icon = ruleIcons[rule.rule_type as keyof typeof ruleIcons] || Bell;

                return (
                  <Card key={rule.rule_type} className="transition-shadow hover:shadow-md">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="rounded-lg bg-muted p-2">
                            <Icon className="h-5 w-5" />
                          </div>
                          <div>
                            <CardTitle className="text-lg">{rule.name}</CardTitle>
                            <CardDescription className="mt-1">{rule.description}</CardDescription>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {getSeverityBadge(rule.severity)}
                          <Badge variant={rule.is_active ? "default" : "secondary"}>{rule.is_active ? "Active" : "Inactive"}</Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                        <div>
                          <h4 className="mb-2 text-sm font-medium">Condition</h4>
                          <p className="text-sm text-muted-foreground">{rule.condition_description}</p>
                        </div>

                        <div>
                          <h4 className="mb-2 text-sm font-medium">Threshold</h4>
                          <p className="text-sm text-muted-foreground">
                            {rule.threshold}
                            {rule.rule_type === "LOW_CASH" && "%"}
                            {rule.rule_type === "HIGH_TRANSACTION_FAILURES" && "%"}
                            {rule.rule_type === "NETWORK_ISSUES" && " failures"}
                            {rule.rule_type === "HARDWARE_MALFUNCTION" && " error"}
                            {rule.rule_type === "UNUSUAL_ACTIVITY" && " std dev"}
                          </p>
                        </div>

                        <div>
                          <h4 className="mb-2 text-sm font-medium">Cooldown</h4>
                          <p className="text-sm text-muted-foreground">
                            {rule.cooldown_minutes < 60
                              ? `${rule.cooldown_minutes} minutes`
                              : rule.cooldown_minutes < 1440
                                ? `${Math.floor(rule.cooldown_minutes / 60)} hours`
                                : `${Math.floor(rule.cooldown_minutes / 1440)} days`}
                          </p>
                        </div>
                      </div>

                      <Separator />

                      <div>
                        <h4 className="mb-2 text-sm font-medium">Notification Channels</h4>
                        <div className="flex gap-2">
                          {rule.notification_channels.map((channel) => (
                            <Badge key={channel} variant="outline" className="capitalize">
                              {channel}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </ScrollArea>

        <div className="flex justify-between border-t pt-4">
          <p className="text-sm text-muted-foreground">These rules are pre-configured and monitor your ATM network automatically.</p>
          <Button onClick={() => onOpenChange(false)}>Close</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

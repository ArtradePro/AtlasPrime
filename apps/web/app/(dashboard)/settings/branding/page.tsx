"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Palette,
  Globe,
  Mail,
  Check,
  X,
  AlertCircle,
  Eye,
  Upload,
} from "lucide-react";

// Mock white-label settings
const mockSettings = {
  enabled: true,
  branding: {
    companyName: "My Agency CRM",
    logoUrl: null,
    faviconUrl: null,
    primaryColor: "#3B82F6",
    secondaryColor: "#10B981",
    accentColor: "#8B5CF6",
    darkMode: false,
  },
  domain: {
    customDomain: "crm.myagency.com",
    verified: true,
    sslEnabled: true,
  },
  emailSettings: {
    fromName: "My Agency",
    fromEmail: "hello@myagency.com",
    replyTo: "support@myagency.com",
  },
  hidePoweredBy: true,
};

const colorPresets = [
  { name: "Blue", primary: "#3B82F6", secondary: "#10B981" },
  { name: "Purple", primary: "#8B5CF6", secondary: "#EC4899" },
  { name: "Green", primary: "#10B981", secondary: "#3B82F6" },
  { name: "Orange", primary: "#F59E0B", secondary: "#EF4444" },
  { name: "Red", primary: "#EF4444", secondary: "#F59E0B" },
  { name: "Teal", primary: "#14B8A6", secondary: "#6366F1" },
];

export default function BrandingPage() {
  const [settings, setSettings] = useState(mockSettings);
  const [hasChanges, setHasChanges] = useState(false);

  const updateBranding = (key: string, value: string | boolean) => {
    setSettings((prev) => ({
      ...prev,
      branding: { ...prev.branding, [key]: value },
    }));
    setHasChanges(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Branding & White-Label</h1>
          <p className="text-muted-foreground">
            Customize Atlas Prime with your own branding
          </p>
        </div>
        {hasChanges && (
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => setHasChanges(false)}>
              Discard
            </Button>
            <Button onClick={() => setHasChanges(false)}>Save Changes</Button>
          </div>
        )}
      </div>

      {/* Enable White-Label */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>White-Label Mode</CardTitle>
              <CardDescription>
                Enable custom branding for your organization
              </CardDescription>
            </div>
            <Switch
              checked={settings.enabled}
              onCheckedChange={(checked: boolean) => {
                setSettings((prev) => ({ ...prev, enabled: checked }));
                setHasChanges(true);
              }}
            />
          </div>
        </CardHeader>
      </Card>

      {settings.enabled && (
        <>
          {/* Company Info */}
          <Card>
            <CardHeader>
              <CardTitle>Company Information</CardTitle>
              <CardDescription>Your brand identity</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>Company Name</Label>
                <Input
                  value={settings.branding.companyName}
                  onChange={(e) =>
                    updateBranding("companyName", e.target.value)
                  }
                />
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Logo</Label>
                  <div className="border-2 border-dashed rounded-lg p-6 text-center">
                    {settings.branding.logoUrl ? (
                      <img
                        src={settings.branding.logoUrl}
                        alt="Logo"
                        className="max-h-16 mx-auto"
                      />
                    ) : (
                      <div>
                        <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                        <p className="text-sm text-muted-foreground">
                          Upload your logo
                        </p>
                        <p className="text-xs text-muted-foreground">
                          PNG, SVG up to 2MB
                        </p>
                      </div>
                    )}
                    <Button variant="outline" size="sm" className="mt-3">
                      Upload Logo
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Favicon</Label>
                  <div className="border-2 border-dashed rounded-lg p-6 text-center">
                    {settings.branding.faviconUrl ? (
                      <img
                        src={settings.branding.faviconUrl}
                        alt="Favicon"
                        className="h-8 w-8 mx-auto"
                      />
                    ) : (
                      <div>
                        <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                        <p className="text-sm text-muted-foreground">
                          Upload favicon
                        </p>
                        <p className="text-xs text-muted-foreground">
                          32x32 ICO or PNG
                        </p>
                      </div>
                    )}
                    <Button variant="outline" size="sm" className="mt-3">
                      Upload Favicon
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Colors */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                Brand Colors
              </CardTitle>
              <CardDescription>Customize the color scheme</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Presets */}
              <div>
                <Label className="mb-3 block">Color Presets</Label>
                <div className="flex gap-2 flex-wrap">
                  {colorPresets.map((preset) => (
                    <button
                      key={preset.name}
                      onClick={() => {
                        updateBranding("primaryColor", preset.primary);
                        updateBranding("secondaryColor", preset.secondary);
                      }}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg border hover:bg-muted transition-colors"
                    >
                      <div
                        className="h-4 w-4 rounded-full"
                        style={{ backgroundColor: preset.primary }}
                      />
                      <div
                        className="h-4 w-4 rounded-full"
                        style={{ backgroundColor: preset.secondary }}
                      />
                      <span className="text-sm">{preset.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom colors */}
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label>Primary Color</Label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={settings.branding.primaryColor}
                      onChange={(e) =>
                        updateBranding("primaryColor", e.target.value)
                      }
                      className="h-10 w-14 rounded border cursor-pointer"
                    />
                    <Input
                      value={settings.branding.primaryColor}
                      onChange={(e) =>
                        updateBranding("primaryColor", e.target.value)
                      }
                      className="flex-1"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Secondary Color</Label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={settings.branding.secondaryColor}
                      onChange={(e) =>
                        updateBranding("secondaryColor", e.target.value)
                      }
                      className="h-10 w-14 rounded border cursor-pointer"
                    />
                    <Input
                      value={settings.branding.secondaryColor}
                      onChange={(e) =>
                        updateBranding("secondaryColor", e.target.value)
                      }
                      className="flex-1"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Accent Color</Label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={settings.branding.accentColor}
                      onChange={(e) =>
                        updateBranding("accentColor", e.target.value)
                      }
                      className="h-10 w-14 rounded border cursor-pointer"
                    />
                    <Input
                      value={settings.branding.accentColor}
                      onChange={(e) =>
                        updateBranding("accentColor", e.target.value)
                      }
                      className="flex-1"
                    />
                  </div>
                </div>
              </div>

              {/* Preview */}
              <div>
                <Label className="mb-3 block">Preview</Label>
                <div className="p-4 rounded-lg border bg-background">
                  <div className="flex items-center gap-3 mb-4">
                    <div
                      className="h-8 w-8 rounded-lg flex items-center justify-center text-white font-bold"
                      style={{
                        backgroundColor: settings.branding.primaryColor,
                      }}
                    >
                      {settings.branding.companyName.charAt(0)}
                    </div>
                    <span className="font-bold">
                      {settings.branding.companyName}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      className="px-4 py-2 rounded-lg text-white text-sm"
                      style={{
                        backgroundColor: settings.branding.primaryColor,
                      }}
                    >
                      Primary Button
                    </button>
                    <button
                      className="px-4 py-2 rounded-lg text-white text-sm"
                      style={{
                        backgroundColor: settings.branding.secondaryColor,
                      }}
                    >
                      Secondary
                    </button>
                    <button
                      className="px-4 py-2 rounded-lg border text-sm"
                      style={{
                        borderColor: settings.branding.accentColor,
                        color: settings.branding.accentColor,
                      }}
                    >
                      Accent
                    </button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Custom Domain */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Custom Domain
              </CardTitle>
              <CardDescription>
                Use your own domain for a fully branded experience
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Domain</Label>
                <div className="flex gap-2">
                  <Input
                    value={settings.domain?.customDomain || ""}
                    placeholder="crm.yourdomain.com"
                  />
                  {settings.domain?.verified ? (
                    <Badge className="bg-green-500">
                      <Check className="h-3 w-3 mr-1" />
                      Verified
                    </Badge>
                  ) : (
                    <Button>Verify</Button>
                  )}
                </div>
              </div>

              {settings.domain?.customDomain && (
                <div className="p-4 rounded-lg bg-muted/50">
                  <h4 className="font-medium mb-2">DNS Configuration</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between p-2 rounded bg-background">
                      <div>
                        <span className="font-mono text-xs">CNAME</span>
                        <span className="mx-2">→</span>
                        <span className="font-mono text-xs">
                          {settings.domain.customDomain}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs text-muted-foreground">
                          app.atlasprime.com
                        </span>
                        {settings.domain.verified ? (
                          <Check className="h-4 w-4 text-green-500" />
                        ) : (
                          <AlertCircle className="h-4 w-4 text-yellow-500" />
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Email Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Email Branding
              </CardTitle>
              <CardDescription>
                Customize outgoing email settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>From Name</Label>
                  <Input value={settings.emailSettings?.fromName || ""} />
                </div>
                <div className="space-y-2">
                  <Label>From Email</Label>
                  <Input value={settings.emailSettings?.fromEmail || ""} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Reply-To Address</Label>
                <Input value={settings.emailSettings?.replyTo || ""} />
              </div>
            </CardContent>
          </Card>

          {/* Additional Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Additional Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Hide "Powered by Atlas Prime"</Label>
                  <p className="text-sm text-muted-foreground">
                    Remove branding from footer and emails
                  </p>
                </div>
                <Switch
                  checked={settings.hidePoweredBy}
                  onCheckedChange={(checked: boolean) => {
                    setSettings((prev) => ({
                      ...prev,
                      hidePoweredBy: checked,
                    }));
                    setHasChanges(true);
                  }}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Dark Mode Default</Label>
                  <p className="text-sm text-muted-foreground">
                    Set dark mode as default for users
                  </p>
                </div>
                <Switch
                  checked={settings.branding.darkMode}
                  onCheckedChange={(checked: boolean) =>
                    updateBranding("darkMode", checked)
                  }
                />
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}

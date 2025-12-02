import React, { useEffect, useState } from "react";
import "./Setting.css";
const DEFAULTS = {
    profile: {
        displayName: "",
        bio: "",
        visibility: "public", // public | org | private
    },
    notifications: {
        email: true,
        push: false,
        weeklyDigest: true,
        digestFrequency: "weekly", // daily | weekly | monthly
    },
    editor: {
        autosave: true,
        autosaveIntervalSec: 30,
        enableMarkdownPreview: true,
    },
    privacy: {
        allowSearchIndexing: true,
        shareUsageAnalytics: false,
    },
    appearance: {
        theme: "system", // light | dark | system
        fontSize: "medium", // small | medium | large
    },
    integrations: {
        google: false,
        github: false,
    },
};

const STORAGE_KEY = "ks_platform_settings_v1";

export default function SettingsTab() {
    const [settings, setSettings] = useState(DEFAULTS);
    const [dirty, setDirty] = useState(false);
    const [savedAt, setSavedAt] = useState(null);

    // Load from localStorage on mount
    useEffect(() => {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (raw) {
                setSettings(prev => ({ ...prev, ...JSON.parse(raw) }));
            }
        } catch (e) {
            console.warn("Failed reading settings from localStorage", e);
        }
    }, []);

    // Generic updater
    function update(path, value) {
        setSettings(prev => {
            const copy = JSON.parse(JSON.stringify(prev));
            const parts = path.split(".");
            let cur = copy;
            for (let i = 0; i < parts.length - 1; i++) cur = cur[parts[i]];
            cur[parts[parts.length - 1]] = value;
            return copy;
        });
        setDirty(true);
    }

    function handleSave(e) {
        e.preventDefault();
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
            setSavedAt(new Date().toISOString());
            setDirty(false);
        } catch (err) {
            console.error("Failed to save settings", err);
            alert("Unable to save settings in this browser.");
        }
    }

    function handleResetDefaults() {
        if (!confirm("Reset all settings to defaults?")) return;
        setSettings(JSON.parse(JSON.stringify(DEFAULTS)));
        setDirty(true);
    }

    function handleExport() {
        const blob = new Blob([JSON.stringify(settings, null, 2)], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "ks-platform-settings.json";
        a.click();
        URL.revokeObjectURL(url);
    }

    function handleImport(file) {
        if (!file) return;
        const reader = new FileReader();
        reader.onload = () => {
            try {
                const parsed = JSON.parse(reader.result);
                setSettings(prev => ({ ...prev, ...parsed }));
                setDirty(true);
            } catch (e) {
                alert("Invalid settings file (must be valid JSON).");
            }
        };
        reader.readAsText(file);
    }

    return (
        <div className="max-w-4xl mx-auto p-6 bg-white/80 dark:bg-slate-900/60 rounded-2xl shadow-lg">
            <header className="flex items-start justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-semibold">Settings</h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Customize how the knowledge platform behaves for you and your organization.</p>
                </div>
                <div className="text-right">
                    <div className="text-xs text-slate-500">Status</div>
                    <div className="mt-1 text-sm font-medium">{dirty ? "Unsaved changes" : "All changes saved"}</div>
                    {savedAt && <div className="text-xs text-slate-400">Last saved: {new Date(savedAt).toLocaleString()}</div>}
                </div>
            </header>

            <form onSubmit={handleSave} className="space-y-8">
                {/* Profile */}
                <section className="p-4 rounded-lg border border-slate-100 dark:border-slate-800">
                    <h2 className="font-medium">Profile</h2>
                    <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <label className="flex flex-col">
                            <span className="text-sm text-slate-600">Display name</span>
                            <input
                                value={settings.profile.displayName}
                                onChange={e => update("profile.displayName", e.target.value)}
                                className="mt-1 input input-bordered w-full"
                                placeholder="Your full name or handle"
                            />
                        </label>

                        <label className="flex flex-col">
                            <span className="text-sm text-slate-600">Visibility</span>
                            <select
                                value={settings.profile.visibility}
                                onChange={e => update("profile.visibility", e.target.value)}
                                className="mt-1 select select-bordered w-full"
                            >
                                <option value="public">Public — visible to anyone</option>
                                <option value="org">Organization — visible to members only</option>
                                <option value="private">Private — only you</option>
                            </select>
                        </label>

                        <label className="col-span-1 md:col-span-2 flex flex-col">
                            <span className="text-sm text-slate-600">Bio</span>
                            <textarea
                                value={settings.profile.bio}
                                onChange={e => update("profile.bio", e.target.value)}
                                rows={3}
                                className="mt-1 textarea textarea-bordered w-full"
                                placeholder="Short description about you and what you write about"
                            />
                        </label>
                    </div>
                </section>

                {/* Notifications */}
                <section className="p-4 rounded-lg border border-slate-100 dark:border-slate-800">
                    <h2 className="font-medium">Notifications</h2>
                    <div className="mt-4 space-y-4">
                        <label className="flex items-center gap-3">
                            <input
                                type="checkbox"
                                checked={settings.notifications.email}
                                onChange={e => update("notifications.email", e.target.checked)}
                            />
                            <span className="text-sm">Email notifications</span>
                        </label>

                        <label className="flex items-center gap-3">
                            <input
                                type="checkbox"
                                checked={settings.notifications.push}
                                onChange={e => update("notifications.push", e.target.checked)}
                            />
                            <span className="text-sm">Push notifications</span>
                        </label>

                        <div className="pt-2">
                            <label className="flex items-center gap-3">
                                <input
                                    type="checkbox"
                                    checked={settings.notifications.weeklyDigest}
                                    onChange={e => update("notifications.weeklyDigest", e.target.checked)}
                                />
                                <span className="text-sm">Receive digest</span>
                            </label>

                            {settings.notifications.weeklyDigest && (
                                <div className="mt-2">
                                    <label className="text-sm">Digest frequency</label>
                                    <select
                                        value={settings.notifications.digestFrequency}
                                        onChange={e => update("notifications.digestFrequency", e.target.value)}
                                        className="ml-2 select select-ghost"
                                    >
                                        <option value="daily">Daily</option>
                                        <option value="weekly">Weekly</option>
                                        <option value="monthly">Monthly</option>
                                    </select>
                                </div>
                            )}
                        </div>
                    </div>
                </section>

                {/* Editor */}
                <section className="p-4 rounded-lg border border-slate-100 dark:border-slate-800">
                    <h2 className="font-medium">Editor & Content</h2>
                    <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <label className="flex items-center gap-3">
                            <input
                                type="checkbox"
                                checked={settings.editor.autosave}
                                onChange={e => update("editor.autosave", e.target.checked)}
                            />
                            <div className="flex-1">
                                <div className="text-sm">Auto-save drafts</div>
                                <div className="text-xs text-slate-400">Saves progress automatically every chosen seconds</div>
                            </div>
                        </label>

                        <label className="flex flex-col">
                            <span className="text-sm">Auto-save interval (sec)</span>
                            <input
                                type="number"
                                min={5}
                                max={600}
                                value={settings.editor.autosaveIntervalSec}
                                onChange={e => update("editor.autosaveIntervalSec", Number(e.target.value))}
                                className="mt-1 input input-bordered w-36"
                            />
                        </label>

                        <label className="flex items-center gap-3 col-span-1 md:col-span-2">
                            <input
                                type="checkbox"
                                checked={settings.editor.enableMarkdownPreview}
                                onChange={e => update("editor.enableMarkdownPreview", e.target.checked)}
                            />
                            <span className="text-sm">Enable markdown preview</span>
                        </label>
                    </div>
                </section>

                {/* Privacy & Appearance */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <section className="p-4 rounded-lg border border-slate-100 dark:border-slate-800">
                        <h2 className="font-medium">Privacy</h2>
                        <div className="mt-4 space-y-3">
                            <label className="flex items-center gap-3">
                                <input
                                    type="checkbox"
                                    checked={settings.privacy.allowSearchIndexing}
                                    onChange={e => update("privacy.allowSearchIndexing", e.target.checked)}
                                />
                                <span className="text-sm">Allow content to be indexed by search engines</span>
                            </label>

                            <label className="flex items-center gap-3">
                                <input
                                    type="checkbox"
                                    checked={settings.privacy.shareUsageAnalytics}
                                    onChange={e => update("privacy.shareUsageAnalytics", e.target.checked)}
                                />
                                <span className="text-sm">Share anonymous usage analytics</span>
                            </label>
                        </div>
                    </section>

                    <section className="p-4 rounded-lg border border-slate-100 dark:border-slate-800">
                        <h2 className="font-medium">Appearance</h2>
                        <div className="mt-4 space-y-3">
                            <label className="flex flex-col">
                                <span className="text-sm">Theme</span>
                                <select
                                    value={settings.appearance.theme}
                                    onChange={e => update("appearance.theme", e.target.value)}
                                    className="mt-1 select select-bordered w-full"
                                >
                                    <option value="system">System default</option>
                                    <option value="light">Light</option>
                                    <option value="dark">Dark</option>
                                </select>
                            </label>

                            <label className="flex flex-col">
                                <span className="text-sm">Font size</span>
                                <select
                                    value={settings.appearance.fontSize}
                                    onChange={e => update("appearance.fontSize", e.target.value)}
                                    className="mt-1 select select-bordered w-full"
                                >
                                    <option value="small">Small</option>
                                    <option value="medium">Medium</option>
                                    <option value="large">Large</option>
                                </select>
                            </label>
                        </div>
                    </section>
                </div>

                {/* Integrations & Account tools */}
                <section className="p-4 rounded-lg border border-slate-100 dark:border-slate-800">
                    <h2 className="font-medium">Integrations & Account</h2>
                    <div className="mt-4 space-y-4">
                        <div className="flex items-center gap-3">
                            <input type="checkbox" checked={settings.integrations.google} onChange={e => update("integrations.google", e.target.checked)} />
                            <span className="text-sm">Connect Google account</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <input type="checkbox" checked={settings.integrations.github} onChange={e => update("integrations.github", e.target.checked)} />
                            <span className="text-sm">Connect GitHub</span>
                        </div>

                        <div className="flex items-center gap-3">
                            <button type="button" onClick={handleExport} className="btn btn-ghost btn-sm">
                                Export settings
                            </button>

                            <label className="btn btn-ghost btn-sm cursor-pointer" htmlFor="import-settings">
                                Import settings
                                <input
                                    id="import-settings"
                                    type="file"
                                    accept="application/json"
                                    onChange={e => handleImport(e.target.files?.[0])}
                                    className="hidden"
                                />
                            </label>

                            <button type="button" onClick={() => {
                                if (!confirm('Are you sure you want to deactivate your account? This is reversible by contacting support.')) return;
                                alert('Account deactivation requested — hook this up to your backend.');
                            }} className="ml-2 btn btn-outline btn-sm text-red-600">
                                Deactivate account
                            </button>
                        </div>
                    </div>
                </section>

                <div className="flex items-center justify-between">
                    <div className="space-x-2">
                        <button type="button" onClick={handleResetDefaults} className="btn btn-ghost">
                            Reset to defaults
                        </button>
                        <button type="button" onClick={() => {
                            setSettings(prev => ({ ...prev }));
                            // simple undo if desired — currently just triggers re-render
                        }} className="btn btn-ghost">
                            Undo
                        </button>
                    </div>

                    <div className="flex items-center gap-3">
                        <button type="submit" className="btn btn-primary" disabled={!dirty}>
                            Save changes
                        </button>
                        <button type="button" onClick={() => {
                            try {
                                const raw = localStorage.getItem(STORAGE_KEY);
                                if (!raw) { alert('No saved settings found.'); return; }
                                setSettings(JSON.parse(raw));
                                setDirty(false);
                                setSavedAt(new Date().toISOString());
                            } catch (e) { alert('Failed to load saved settings.'); }
                        }} className="btn btn-outline">
                            Load saved
                        </button>
                    </div>
                </div>
            </form>

            <footer className="mt-6 text-xs text-slate-400">Tip: settings persist in your browser. Connect this UI to your backend to sync across devices.</footer>
        </div>
    );
}

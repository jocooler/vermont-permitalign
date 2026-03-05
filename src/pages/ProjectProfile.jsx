import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { ArrowLeft, CheckCircle2, User, Building2, Calendar, Phone, Mail, MapPin } from "lucide-react";
import { createPageUrl } from "@/utils";

export default function ProjectProfile() {
  const [searchParams] = useSearchParams();
  const projectId = searchParams.get("id");
  const backToProject = searchParams.get("back") === "project";
  const isStaff = localStorage.getItem("vt_portal_mode") === "staff";
  
  const [project, setProject] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const [form, setForm] = useState({
    applicant_name: "",
    applicant_organization: "",
    applicant_email: "",
    applicant_phone: "",
    applicant_mailing_address: "",
    project_description: "",
    anticipated_start_date: "",
    anticipated_end_date: "",
  });

  const [projectForm, setProjectForm] = useState({
    name: "",
    description: "",
    address: "",
    town: "",
    parcel_id: "",
    unit_count: 4,
    disturbed_acres: 0,
  });

  useEffect(() => {
    async function load() {
      if (!projectId) {
        setLoading(false);
        return;
      }
      const p = await base44.entities.Project.filter({ id: projectId }).then(r => r?.[0]);
      setProject(p);
      
      // Try to load existing profile from project metadata
      if (p?.profile) {
        setProfile(p.profile);
        setForm(p.profile);
      }
      
      // Load project details
      setProjectForm({
        name: p?.name || "",
        description: p?.description || "",
        address: p?.address || "",
        town: p?.town || "",
        parcel_id: p?.parcel_id || "",
        unit_count: p?.unit_count || 4,
        disturbed_acres: p?.disturbed_acres || 0,
      });
      
      setLoading(false);
    }
    load();
  }, [projectId]);

  const handleSave = async () => {
    setSaving(true);
    const updateData = {
      profile: form,
      name: projectForm.name,
      description: projectForm.description,
      address: projectForm.address,
      town: projectForm.town,
      parcel_id: projectForm.parcel_id,
      unit_count: Number(projectForm.unit_count),
      disturbed_acres: Number(projectForm.disturbed_acres),
    };
    await base44.entities.Project.update(projectId, updateData);
    setProject(prev => prev ? { ...prev, ...updateData } : null);
    setProfile(form);
    setIsEditing(false);
    setSaving(false);
    if (backToProject) {
      window.location.href = `${createPageUrl("Projects")}?project=${projectId}`;
    }
  };

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const setProject = (k, v) => setProjectForm(f => ({ ...f, [k]: v }));

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
        <div className="space-y-4">
          {[1,2,3].map(i => <div key={i} className="vt-card p-4 animate-pulse h-12" />)}
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
        <div className="vt-card p-8 text-center">
          <p className="text-slate-500">Project not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
      <a href={isStaff ? "javascript:history.back()" : createPageUrl("Projects")} className="flex items-center gap-1.5 text-sm font-medium mb-6 hover:opacity-70 transition-opacity" style={{ color: "var(--vt-green)" }}>
        <ArrowLeft size={15} /> {isStaff ? "Back" : "Back to Projects"}
      </a>

      <div className="rounded-xl mb-6 p-6" style={{ background: "linear-gradient(135deg, #1a3d2e 0%, #2d6a4f 100%)" }}>
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-xs font-bold uppercase tracking-widest text-green-300 mb-1">Project Profile</div>
            <h1 className="text-2xl font-bold text-white" style={{ fontFamily: "Georgia, serif" }}>{project.name}</h1>
            {project.address && <p className="text-sm text-green-200 mt-1 flex items-center gap-1.5"><MapPin size={13} />{project.address}, {project.town}</p>}
          </div>
          {!isEditing && !isStaff && (
            <button onClick={() => setIsEditing(true)} className="text-sm font-semibold px-4 py-2 rounded bg-white hover:bg-green-50 transition-colors" style={{ color: "var(--vt-green-dark)" }}>
              Edit Profile
            </button>
          )}
        </div>
      </div>

      {profile && !isEditing && (
        <div className="vt-card p-6 mb-6">
          <div className="grid sm:grid-cols-2 gap-6">
            <div>
              <div className="text-xs font-bold uppercase tracking-wide text-slate-400 mb-2 flex items-center gap-1.5"><User size={12} /> Applicant</div>
              <div className="space-y-2 text-sm">
                <div><span className="text-slate-400">Name:</span> <span className="text-slate-800 font-medium">{profile.applicant_name}</span></div>
                {profile.applicant_email && <div><span className="text-slate-400">Email:</span> <span className="text-slate-800 font-medium">{profile.applicant_email}</span></div>}
                {profile.applicant_phone && <div><span className="text-slate-400">Phone:</span> <span className="text-slate-800 font-medium">{profile.applicant_phone}</span></div>}
                {profile.applicant_organization && <div><span className="text-slate-400">Organization:</span> <span className="text-slate-800 font-medium">{profile.applicant_organization}</span></div>}
              </div>
            </div>
            <div>
              <div className="text-xs font-bold uppercase tracking-wide text-slate-400 mb-2 flex items-center gap-1.5"><Calendar size={12} /> Timeline</div>
              <div className="space-y-2 text-sm">
                {profile.anticipated_start_date && <div><span className="text-slate-400">Start:</span> <span className="text-slate-800 font-medium">{profile.anticipated_start_date}</span></div>}
                {profile.anticipated_end_date && <div><span className="text-slate-400">End:</span> <span className="text-slate-800 font-medium">{profile.anticipated_end_date}</span></div>}
              </div>
            </div>
          </div>
          {profile.project_description && (
            <div className="mt-5 p-4 rounded-lg bg-slate-50 border border-slate-200">
              <div className="text-xs font-bold uppercase tracking-wide text-slate-400 mb-2 flex items-center gap-1.5"><Building2 size={12} /> Project Description</div>
              <p className="text-sm text-slate-700">{profile.project_description}</p>
            </div>
          )}
        </div>
      )}

      {isEditing && (
        <div className="vt-card p-6 mb-6">
          <h2 className="text-lg font-bold text-green-900 mb-6">Update Project Profile</h2>
          <div className="space-y-5">
            <div className="rounded-lg border-l-4 border-amber-400 bg-amber-50 p-4">
              <p className="text-sm text-amber-800">
                <strong>Info will be pre-filled</strong> in all future permit applications for this project, reducing duplicate data entry.
              </p>
            </div>

            <div>
              <h3 className="font-bold text-green-900 mb-4 flex items-center gap-2"><Building2 size={15} /> Project Details</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold mb-1" style={{ color: "var(--vt-gray)" }}>Project Name</label>
                  <input
                    className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-green-400"
                    style={{ borderColor: "var(--vt-gray-light)" }}
                    value={projectForm.name}
                    onChange={e => setProject("name", e.target.value)}
                    placeholder="Project name"
                  />
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold mb-1" style={{ color: "var(--vt-gray)" }}>Town / Municipality</label>
                    <input
                      className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-green-400"
                      style={{ borderColor: "var(--vt-gray-light)" }}
                      value={projectForm.town}
                      onChange={e => setProject("town", e.target.value)}
                      placeholder="Town or municipality"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1" style={{ color: "var(--vt-gray)" }}>Parcel ID (SPAN)</label>
                    <input
                      className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-green-400"
                      style={{ borderColor: "var(--vt-gray-light)" }}
                      value={projectForm.parcel_id}
                      onChange={e => setProject("parcel_id", e.target.value)}
                      placeholder="e.g. 273-086-10023"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1" style={{ color: "var(--vt-gray)" }}>Site Address</label>
                  <input
                    className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-green-400"
                    style={{ borderColor: "var(--vt-gray-light)" }}
                    value={projectForm.address}
                    onChange={e => setProject("address", e.target.value)}
                    placeholder="Street address"
                  />
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold mb-2" style={{ color: "var(--vt-gray-dark)" }}>Number of residential units</label>
                    <div className="flex items-center gap-3">
                      <input
                        type="range"
                        min={1}
                        max={20}
                        value={projectForm.unit_count}
                        onChange={e => setProject("unit_count", Number(e.target.value))}
                        className="flex-1"
                        style={{ accentColor: "var(--vt-green)" }}
                      />
                      <div className="w-12 text-center font-bold text-sm rounded-lg py-1 flex-shrink-0" style={{ background: "var(--vt-green-pale)", color: "var(--vt-green-dark)" }}>{projectForm.unit_count}</div>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2" style={{ color: "var(--vt-gray-dark)" }}>Estimated acres disturbed</label>
                    <div className="flex items-center gap-3">
                      <input
                        type="range"
                        min={0}
                        max={5}
                        step={0.25}
                        value={projectForm.disturbed_acres}
                        onChange={e => setProject("disturbed_acres", Number(e.target.value))}
                        className="flex-1"
                        style={{ accentColor: "var(--vt-green)" }}
                      />
                      <div className="w-12 text-center font-bold text-sm rounded-lg py-1 flex-shrink-0" style={{ background: "var(--vt-green-pale)", color: "var(--vt-green-dark)" }}>{projectForm.disturbed_acres}</div>
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1" style={{ color: "var(--vt-gray)" }}>Project Description</label>
                  <textarea
                    rows={3}
                    className="w-full border rounded px-3 py-2 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-green-400"
                    style={{ borderColor: "var(--vt-gray-light)" }}
                    value={projectForm.description}
                    onChange={e => setProject("description", e.target.value)}
                    placeholder="Describe the project and proposed activities..."
                  />
                </div>
              </div>
            </div>

            <div className="border-t pt-5">
              <h3 className="font-bold text-green-900 mb-4 flex items-center gap-2"><User size={15} /> Applicant Information</h3>
              <div className="space-y-4">
                {[
                  { key: "applicant_name", label: "Full Name *", placeholder: "First and Last Name" },
                  { key: "applicant_organization", label: "Organization / Company", placeholder: "Optional" },
                  { key: "applicant_email", label: "Email Address *", placeholder: "you@example.com" },
                  { key: "applicant_phone", label: "Phone Number", placeholder: "(802) 555-0100" },
                  { key: "applicant_mailing_address", label: "Mailing Address", placeholder: "Street, City, State, ZIP" },
                ].map(f => (
                  <div key={f.key}>
                    <label className="block text-xs font-semibold mb-1" style={{ color: "var(--vt-gray)" }}>{f.label}</label>
                    <input
                      className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-green-400"
                      style={{ borderColor: "var(--vt-gray-light)" }}
                      value={form[f.key]}
                      onChange={e => set(f.key, e.target.value)}
                      placeholder={f.placeholder}
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t pt-5">
              <h3 className="font-bold text-green-900 mb-4 flex items-center gap-2"><Calendar size={15} /> Project Timeline</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold mb-1" style={{ color: "var(--vt-gray)" }}>Project Description</label>
                  <textarea
                    rows={3}
                    className="w-full border rounded px-3 py-2 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-green-400"
                    style={{ borderColor: "var(--vt-gray-light)" }}
                    value={form.project_description}
                    onChange={e => set("project_description", e.target.value)}
                    placeholder="Describe the proposed work..."
                  />
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold mb-1" style={{ color: "var(--vt-gray)" }}>Anticipated Start Date</label>
                    <input
                      type="date"
                      className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-green-400"
                      style={{ borderColor: "var(--vt-gray-light)" }}
                      value={form.anticipated_start_date}
                      onChange={e => set("anticipated_start_date", e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1" style={{ color: "var(--vt-gray)" }}>Anticipated End Date</label>
                    <input
                      type="date"
                      className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-green-400"
                      style={{ borderColor: "var(--vt-gray-light)" }}
                      value={form.anticipated_end_date}
                      onChange={e => set("anticipated_end_date", e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-4 border-t">
              <button
                onClick={() => { setIsEditing(false); setForm(profile || form); }}
                className="flex-1 px-4 py-2.5 rounded font-medium text-sm"
                style={{ background: "var(--vt-gray-light)", color: "var(--vt-gray-dark)" }}
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded font-semibold text-sm disabled:opacity-60 bg-green-700 text-white hover:bg-green-800"
              >
                {saving ? "Saving…" : <><CheckCircle2 size={14} /> Save Profile</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {profile && !isEditing && !isStaff && (
        <div className="rounded-lg border border-green-200 bg-green-50 p-5">
          <p className="text-sm text-green-800">
            <strong>✓ Profile complete.</strong> This information will auto-fill when you start new permit applications.
          </p>
        </div>
      )}
    </div>
  );
}
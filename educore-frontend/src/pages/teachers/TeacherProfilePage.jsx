import { useEffect, useState } from "react";
import { UserRound, BriefcaseBusiness, Phone } from "lucide-react";
import { getMyTeacherProfile } from "@/api/teacherApi";
import { useAuth } from "@/context/AuthContext";

function TeacherProfilePage() {
    const { user } = useAuth();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        let active = true;
        getMyTeacherProfile()
            .then((data) => { if (active) setProfile(data); })
            .catch((err) => {
                if (active) setError(err.response?.data?.message || "Unable to load your profile. Please try again.");
            })
            .finally(() => { if (active) setLoading(false); });
        return () => { active = false; };
    }, []);

    const fullName = profile
        ? [profile.first_name, profile.middle_name, profile.surname].filter(Boolean).join(" ")
        : user?.full_name || "Teacher";

    if (loading) return <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-500">Loading your profile...</div>;
    if (error) return <div className="rounded-2xl border border-red-200 bg-red-50 p-6"><h1 className="font-semibold text-red-800">Unable to load profile</h1><p className="mt-2 text-sm text-red-700">{error}</p></div>;
    if (!profile) return <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-500">Your teacher profile could not be found. Please contact your school administrator.</div>;

    return (
        <div className="mx-auto w-full max-w-5xl space-y-6">
            <header className="border-b border-slate-200 pb-5">
                <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">My Profile</h1>
                <p className="mt-2 text-sm leading-6 text-slate-500">View your personal, contact and employment information recorded by your school.</p>
            </header>

            <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="flex flex-col gap-4 bg-gradient-to-r from-blue-700 to-indigo-700 p-6 text-white sm:flex-row sm:items-center">
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/15"><UserRound className="h-8 w-8" /></div>
                    <div className="min-w-0">
                        <h2 className="break-words text-2xl font-bold">{fullName}</h2>
                        <p className="mt-1 text-sm text-blue-100">Staff Number: {profile.staff_number || "Not available"}</p>
                        <p className="mt-1 text-sm text-blue-100">{profile.department_name || "Department not assigned"}</p>
                    </div>
                    <span className={`sm:ml-auto self-start rounded-full px-3 py-1 text-xs font-semibold ${profile.status ? "bg-emerald-100 text-emerald-800" : "bg-white/20 text-white"}`}>{profile.status ? "Active" : "Inactive"}</span>
                </div>

                <div className="grid gap-6 p-5 sm:p-6 md:grid-cols-2">
                    <ProfileSection title="Personal Information" icon={<UserRound className="h-4 w-4" />}>
                        <ProfileRow label="Surname" value={profile.surname} />
                        <ProfileRow label="First name" value={profile.first_name} />
                        <ProfileRow label="Middle name" value={profile.middle_name} />
                        <ProfileRow label="Gender" value={profile.gender} />
                        <ProfileRow label="Date of birth" value={formatDate(profile.date_of_birth)} />
                    </ProfileSection>
                    <ProfileSection title="Account Information" icon={<UserRound className="h-4 w-4" />}>
                        <ProfileRow label="Username" value={profile.username || user?.username} />
                        <ProfileRow label="Account email" value={profile.email || user?.email} />
                        <ProfileRow label="Password status" value={profile.must_change_password ? "Temporary password — change required" : "Password set"} />
                    </ProfileSection>
                    <ProfileSection title="Contact Information" icon={<Phone className="h-4 w-4" />}>
                        <ProfileRow label="Phone number" value={profile.phone_number} />
                        <ProfileRow label="Email" value={profile.email} />
                        <ProfileRow label="Address" value={profile.address} />
                    </ProfileSection>
                    <ProfileSection title="Employment Information" icon={<BriefcaseBusiness className="h-4 w-4" />}>
                        <ProfileRow label="Department" value={profile.department_name} />
                        <ProfileRow label="Qualification" value={profile.qualification_name} />
                        <ProfileRow label="Employment date" value={formatDate(profile.employment_date)} />
                        <ProfileRow label="State" value={profile.state_name} />
                        <ProfileRow label="Nationality" value={profile.nationality_name} />
                    </ProfileSection>
                    <ProfileSection title="Emergency Information" icon={<Phone className="h-4 w-4" />}>
                        <ProfileRow label="Next of kin" value={profile.next_of_kin_name} />
                        <ProfileRow label="Next of kin phone" value={profile.next_of_kin_phone} />
                        <ProfileRow label="Emergency contact" value={profile.emergency_contact_name} />
                        <ProfileRow label="Emergency phone" value={profile.emergency_contact_phone} />
                    </ProfileSection>
                </div>
            </section>
            <p className="text-sm leading-6 text-slate-500">If any information is incorrect, contact your school administrator to have the record updated.</p>
        </div>
    );
}

function ProfileSection({ title, icon, children }) {
    return <section className="min-w-0 rounded-xl border border-slate-200 p-4 sm:p-5">
        <h3 className="mb-3 flex items-center gap-2 border-b border-slate-100 pb-3 font-semibold text-slate-800">{icon}{title}</h3>
        <div>{children}</div>
    </section>;
}

function ProfileRow({ label, value }) {
    return <div className="grid grid-cols-1 gap-1 border-b border-slate-100 py-2.5 last:border-0 sm:grid-cols-[minmax(100px,0.8fr)_minmax(0,1.2fr)] sm:gap-3">
        <span className="text-sm text-slate-500">{label}</span>
        <span className="break-words text-sm font-medium text-slate-800">{value || "—"}</span>
    </div>;
}

function formatDate(value) {
    if (!value) return "—";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "—";
    return date.toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" });
}

export default TeacherProfilePage;

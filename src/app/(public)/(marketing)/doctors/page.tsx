import PublicDoctorList from "@/components/modules/doctors/doctor-list";
import DoctorList from "@/components/modules/doctors/doctor-list";

export default function page() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Our Doctors</h1>
        <p className="text-muted-foreground">
          Browse verified doctors and find the right specialist for you.
        </p>
      </div>
      <PublicDoctorList />
    </section>
  );
}

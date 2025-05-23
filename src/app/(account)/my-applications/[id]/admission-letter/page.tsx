import AdmissionLetterPage from "./admissions-letter-page";

const page = async ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;
  return <AdmissionLetterPage applicationId={id} />;
};

export default page;

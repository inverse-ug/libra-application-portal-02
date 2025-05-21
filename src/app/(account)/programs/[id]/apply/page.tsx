import ProgramApplyPage from "./program-apply-page";

const page = async ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;
  return <ProgramApplyPage id={id} />;
};

export default page;

import ApplyPage from "./apply-page";

const page = async ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;
  return <ApplyPage id={id} />;
};

export default page;

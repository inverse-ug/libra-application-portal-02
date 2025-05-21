import ShortCourseApplyPage from "./short-course-appy-page";

const page = async ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;
  return <ShortCourseApplyPage id={id} />;
};

export default page;

import WorkpaperEditorPage from "./client-page"

export async function generateStaticParams() {
  return [{ id: "1" }]
}

export default function Page() {
  return <WorkpaperEditorPage />
}

import Link from "next/link";

export default function NotFound() {
  return (
    <div className="page">
      <h1>This room doesn&apos;t exist</h1>
      <p>
        <Link href="/">Return to the entrance</Link> or open the <Link href="/quick">Quick View</Link>.
      </p>
    </div>
  );
}

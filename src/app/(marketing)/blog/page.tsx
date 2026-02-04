import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock } from "lucide-react";
import type { Metadata } from "next";
import { posts } from "./[slug]/page";

export const metadata: Metadata = {
  title: "Blog — Guides, Tutorials & Updates",
  description: "Guides, tutorials, and updates from the InputHaven team. Learn how to build better forms, fight spam, collect submissions, and integrate with any framework.",
  alternates: {
    canonical: "https://inputhaven.com/blog",
  },
  openGraph: {
    title: "InputHaven Blog — Form Backend Guides & Tutorials",
    description: "Learn how to build production-ready forms, fight spam with AI, and integrate with React, Vue, Svelte, Next.js, and more.",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Blog",
  name: "InputHaven Blog",
  description: "Guides, tutorials, and updates about form backends, spam protection, and web development.",
  url: "https://inputhaven.com/blog",
  publisher: {
    "@type": "Organization",
    name: "InputHaven",
    url: "https://inputhaven.com",
  },
  blogPost: posts.map((post) => ({
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt,
    datePublished: post.date,
    url: `https://inputhaven.com/blog/${post.slug}`,
    author: { "@type": "Organization", name: post.author },
  })),
};

export default function BlogPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">Blog</h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Guides, tutorials, and updates from the InputHaven team.
          </p>
        </div>

        <div className="mt-12 grid gap-6">
          {posts.map((post) => (
            <Link key={post.slug} href={`/blog/${post.slug}`}>
              <Card className="transition-shadow hover:shadow-md">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                      {post.category}
                    </span>
                    <time className="text-xs text-muted-foreground">{post.date}</time>
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {post.readingTime}
                    </span>
                  </div>
                  <CardTitle className="mt-2">{post.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{post.excerpt}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {post.tags.slice(0, 3).map((tag) => (
                      <span key={tag} className="rounded-full border px-2 py-0.5 text-xs text-muted-foreground">
                        {tag}
                      </span>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}

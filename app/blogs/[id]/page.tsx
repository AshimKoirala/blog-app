"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { useAuth } from "@/context/auth-context"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Navbar } from "@/components/navbar"
import { ProtectedRoute } from "@/components/protected-route"
import { ArrowLeftIcon, PencilIcon, TrashIcon } from "lucide-react"

type Blog = {
  id: string
  title: string
  description: string
  image: string
  authorId: string
  createdAt: string
}

export default function BlogDetailPage() {
  const [blog, setBlog] = useState<Blog | null>(null)
  const [notFound, setNotFound] = useState(false)
  const { user } = useAuth()
  const router = useRouter()
  const params = useParams()
  const blogId = params.id as string

  useEffect(() => {
    if (typeof window !== "undefined" && blogId) {
      const blogsJson = localStorage.getItem("blogs")
      if (blogsJson) {
        const blogs = JSON.parse(blogsJson)
        const foundBlog = blogs.find((b: Blog) => b.id === blogId)

        if (foundBlog) {
          setBlog(foundBlog)
        } else {
          setNotFound(true)
        }
      }
    }
  }, [blogId])

  const handleDeleteBlog = () => {
    if (confirm("Are you sure you want to delete this blog?")) {
      const blogsJson = localStorage.getItem("blogs")
      if (blogsJson) {
        const blogs = JSON.parse(blogsJson)
        const updatedBlogs = blogs.filter((b: Blog) => b.id !== blogId)
        localStorage.setItem("blogs", JSON.stringify(updatedBlogs))
        router.push("/blogs")
      }
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  if (notFound) {
    return (
      <ProtectedRoute>
        <Navbar />
        <div className="container mx-auto px-4 py-8 text-center">
          <h1 className="text-2xl font-bold">Blog not found</h1>
          <p className="mt-2 text-muted-foreground">The blog you are looking for does not exist.</p>
          <Button className="mt-4" onClick={() => router.push("/blogs")}>
            Back to Blogs
          </Button>
        </div>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute>
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <Button variant="ghost" className="mb-6" onClick={() => router.push("/blogs")}>
          <ArrowLeftIcon className="mr-2 h-4 w-4" />
          Back to Blogs
        </Button>

        {blog ? (
          <Card className="overflow-hidden">
            <div className="relative h-64 sm:h-96 w-full">
              <Image src={blog.image || "/placeholder.svg"} alt={blog.title} fill className="object-cover" />
            </div>

            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h1 className="text-3xl font-bold">{blog.title}</h1>
                  <p className="text-muted-foreground mt-1">{formatDate(blog.createdAt)}</p>
                </div>

                {(user?.id === blog.authorId || blog.authorId === "system") && (
                  <div className="flex gap-2">
                    <Link href={`/blogs/edit/${blog.id}`}>
                      <Button variant="outline" size="sm">
                        <PencilIcon className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                    </Link>
                    <Button variant="outline" size="sm" onClick={handleDeleteBlog}>
                      <TrashIcon className="h-4 w-4 mr-2 text-destructive" />
                      Delete
                    </Button>
                  </div>
                )}
              </div>

              <div className="mt-6 prose max-w-none">
                <p className="whitespace-pre-line">{blog.description}</p>
              </div>
            </div>
          </Card>
        ) : (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
              <p className="mt-4 text-lg">Loading...</p>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  )
}

"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { useAuth } from "@/context/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Navbar } from "@/components/navbar"
import { ProtectedRoute } from "@/components/protected-route"
import { PlusIcon, PencilIcon, TrashIcon } from "lucide-react"

type Blog = {
  id: string
  title: string
  description: string
  image: string
  authorId: string
  createdAt: string
}

export default function BlogsPage() {
  const [blogs, setBlogs] = useState<Blog[]>([])
  const { user } = useAuth()

  useEffect(() => {
    if (typeof window !== "undefined") {
      const blogsJson = localStorage.getItem("blogs")
      if (blogsJson) {
        const parsedBlogs = JSON.parse(blogsJson)
        // Sort blogs by createdAt (newest first)
        parsedBlogs.sort((a: Blog, b: Blog) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        setBlogs(parsedBlogs)
      }
    }
  }, [])

  const handleDeleteBlog = (id: string) => {
    if (confirm("Are you sure you want to delete this blog?")) {
      const updatedBlogs = blogs.filter((blog) => blog.id !== id)
      localStorage.setItem("blogs", JSON.stringify(updatedBlogs))
      setBlogs(updatedBlogs)
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

  return (
    <ProtectedRoute>
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Blogs</h1>
          <Link href="/blogs/new">
            <Button>
              <PlusIcon className="mr-2 h-4 w-4" />
              New Blog
            </Button>
          </Link>
        </div>

        {blogs.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No blogs found. Create your first blog!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {blogs.map((blog) => (
              <Card key={blog.id} className="overflow-hidden flex flex-col">
                <div className="relative h-48 w-full">
                  <Image src={blog.image || "/placeholder.svg"} alt={blog.title} fill className="object-cover" />
                </div>
                <CardHeader>
                  <CardTitle className="line-clamp-1">{blog.title}</CardTitle>
                  <CardDescription>{formatDate(blog.createdAt)}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground line-clamp-3">{blog.description}</p>
                </CardContent>
                <CardFooter className="mt-auto flex justify-between">
                  {(user?.id === blog.authorId || blog.authorId === "system") && (
                    <div className="flex gap-2">
                      <Link href={`/blogs/edit/${blog.id}`}>
                        <Button variant="outline" size="sm">
                          <PencilIcon className="h-4 w-4" />
                          <span className="sr-only">Edit</span>
                        </Button>
                      </Link>
                      <Button variant="outline" size="sm" onClick={() => handleDeleteBlog(blog.id)}>
                        <TrashIcon className="h-4 w-4 text-destructive" />
                        <span className="sr-only">Delete</span>
                      </Button>
                    </div>
                  )}
                  <Link href={`/blogs/${blog.id}`}>
                    <Button variant="link" className="ml-auto">
                      Read More
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </ProtectedRoute>
  )
}

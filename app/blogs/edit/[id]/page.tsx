"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { useAuth } from "@/context/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Navbar } from "@/components/navbar"
import { ProtectedRoute } from "@/components/protected-route"
import { ImageIcon } from "lucide-react"

type Blog = {
  id: string
  title: string
  description: string
  image: string
  authorId: string
  createdAt: string
}

export default function EditBlogPage() {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [image, setImage] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")
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
        const blog = blogs.find((b: Blog) => b.id === blogId)

        if (blog) {
          setTitle(blog.title)
          setDescription(blog.description)
          setImage(blog.image)

          if (user?.id !== blog.authorId && blog.authorId !== "system") {
            router.push("/blogs")
          }
        } else {
          setNotFound(true)
        }
      }
    }
  }, [blogId, router, user])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!title || !description) {
      setError("Title and description are required")
      return
    }

    setIsSubmitting(true)

    try {
      const blogsJson = localStorage.getItem("blogs")
      if (blogsJson) {
        const blogs = JSON.parse(blogsJson)

        const updatedBlogs = blogs.map((blog: Blog) => {
          if (blog.id === blogId) {
            return {
              ...blog,
              title,
              description,
              image,
            }
          }
          return blog
        })

        localStorage.setItem("blogs", JSON.stringify(updatedBlogs))
        router.push("/blogs")
      }
    } catch (err) {
      setError("An error occurred while updating the blog")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onloadend = () => {
      if (reader.result) {
        setImage(reader.result.toString())
      }
    }
    reader.readAsDataURL(file)
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
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>Edit Blog</CardTitle>
            <CardDescription>Update your blog post</CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              {error && <div className="bg-destructive/15 text-destructive text-sm p-3 rounded-md">{error}</div>}

              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter blog title"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Enter blog description"
                  className="min-h-[200px]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="image">Cover Image</Label>
                <Input
                  id="image"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="mt-2"
                  onClick={() => document.getElementById("image")?.click()}
                >
                  <ImageIcon className="h-4 w-4 mr-2" />
                  Choose Image
                </Button>
                <div className="mt-4 relative h-40 border rounded-md overflow-hidden">
                  {image ? (
                    <img src={image} alt="Blog cover" className="object-cover w-full h-full" />
                  ) : (
                    <div className="flex items-center justify-center h-full text-sm text-muted-foreground">
                      No image selected
                    </div>
                  )}
                </div>
              </div>
            </CardContent>

            <CardFooter className="flex justify-between">
              <Button type="button" variant="outline" onClick={() => router.push("/blogs")}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Updating..." : "Update Blog"}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </ProtectedRoute>
  )
}

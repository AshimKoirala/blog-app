"use client"

import type React from "react"
import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Navbar } from "@/components/navbar"
import { ProtectedRoute } from "@/components/protected-route"
import { BoldIcon, ItalicIcon, UnderlineIcon, ListIcon, ImageIcon, LinkIcon, EyeIcon, PencilIcon } from "lucide-react"

export default function NewBlogPage() {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [image, setImage] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [activeTab, setActiveTab] = useState("write")
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const { user } = useAuth()
  const router = useRouter()

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
      const blogs = blogsJson ? JSON.parse(blogsJson) : []

      const newBlog = {
        id: Date.now().toString(),
        title,
        description,
        image,
        authorId: user?.id,
        createdAt: new Date().toISOString(),
      }

      blogs.push(newBlog)
      localStorage.setItem("blogs", JSON.stringify(blogs))
      router.push("/blogs")
    } catch (err) {
      setError("An error occurred while creating the blog")
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

  const insertFormatting = (format: string) => {
    if (!textareaRef.current) return

    const textarea = textareaRef.current
    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selectedText = description.substring(start, end)
    let formattedText = ""

    switch (format) {
      case "bold":
        formattedText = `**${selectedText}**`
        break
      case "italic":
        formattedText = `*${selectedText}*`
        break
      case "underline":
        formattedText = `_${selectedText}_`
        break
      case "list":
        formattedText = `\n- ${selectedText}`
        break
      case "link":
        formattedText = `[${selectedText}](url)`
        break
      default:
        formattedText = selectedText
    }

    const newText = description.substring(0, start) + formattedText + description.substring(end)
    setDescription(newText)

    setTimeout(() => {
      textarea.focus()
      textarea.setSelectionRange(start + formattedText.length, start + formattedText.length)
    }, 0)
  }

  const formatPreview = (text: string) => {
    const formatted = text
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*(.*?)\*/g, "<em>$1</em>")
      .replace(/_(.*?)_/g, "<u>$1</u>")
      .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" class="text-primary hover:underline" target="_blank">$1</a>')
      .replace(/\n- (.*)/g, "<ul><li>$1</li></ul>")
      .replace(/\n/g, "<br />")

    return formatted
  }

  return (
    <ProtectedRoute>
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle>Create New Blog</CardTitle>
            <CardDescription>Fill in the details to create a new blog post</CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-6">
              {error && <div className="bg-destructive/15 text-destructive text-sm p-3 rounded-md">{error}</div>}

              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter blog title"
                  className="text-lg"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="image">Cover Image</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
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
                  </div>
                  <div className="relative h-40 rounded-md overflow-hidden border">
                    {image ? (
                      <img src={image} alt="Preview" className="object-cover w-full h-full" />
                    ) : (
                      <div className="flex items-center justify-center h-full text-sm text-muted-foreground">
                        No image selected
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Content</Label>
                <Tabs defaultValue="write" onValueChange={setActiveTab} className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="write" className="flex items-center">
                      <PencilIcon className="h-4 w-4 mr-2" />
                      Write
                    </TabsTrigger>
                    <TabsTrigger value="preview" className="flex items-center">
                      <EyeIcon className="h-4 w-4 mr-2" />
                      Preview
                    </TabsTrigger>
                  </TabsList>
                  <TabsContent value="write" className="space-y-4">
                    <div className="flex flex-wrap gap-2 p-2 border-b">
                      <Button type="button" variant="ghost" size="sm" onClick={() => insertFormatting("bold")}>
                        <BoldIcon className="h-4 w-4" />
                        <span className="sr-only">Bold</span>
                      </Button>
                      <Button type="button" variant="ghost" size="sm" onClick={() => insertFormatting("italic")}>
                        <ItalicIcon className="h-4 w-4" />
                        <span className="sr-only">Italic</span>
                      </Button>
                      <Button type="button" variant="ghost" size="sm" onClick={() => insertFormatting("underline")}>
                        <UnderlineIcon className="h-4 w-4" />
                        <span className="sr-only">Underline</span>
                      </Button>
                      <Button type="button" variant="ghost" size="sm" onClick={() => insertFormatting("list")}>
                        <ListIcon className="h-4 w-4" />
                        <span className="sr-only">List</span>
                      </Button>
                      <Button type="button" variant="ghost" size="sm" onClick={() => insertFormatting("link")}>
                        <LinkIcon className="h-4 w-4" />
                        <span className="sr-only">Link</span>
                      </Button>
                    </div>
                    <Textarea
                      id="description"
                      ref={textareaRef}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Write your blog content here..."
                      className="min-h-[300px] font-mono"
                    />
                    <div className="text-xs text-muted-foreground">
                      <p>Formatting tips:</p>
                      <ul className="list-disc list-inside ml-2">
                        <li>Use **text** for <strong>bold</strong></li>
                        <li>Use *text* for <em>italic</em></li>
                        <li>Use _text_ for <u>underline</u></li>
                        <li>Use - for bullet points</li>
                        <li>Use [text](url) for links</li>
                      </ul>
                    </div>
                  </TabsContent>
                  <TabsContent value="preview">
                    <div className="border rounded-md p-4 min-h-[300px] prose max-w-none">
                      {description ? (
                        <div dangerouslySetInnerHTML={{ __html: formatPreview(description) }} />
                      ) : (
                        <p className="text-muted-foreground italic">Your preview will appear here...</p>
                      )}
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            </CardContent>

            <CardFooter className="flex justify-between">
              <Button type="button" variant="outline" onClick={() => router.push("/blogs")}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Creating..." : "Publish Blog"}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </ProtectedRoute>
  )
}

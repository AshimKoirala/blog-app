"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import { useRouter } from "next/navigation"

type User = {
  id: string
  name: string
  email: string
}

type AuthContextType = {
  user: User | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<boolean>
  signup: (name: string, email: string, password: string) => Promise<boolean>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Check if user is logged in
    const checkAuth = () => {
      const isLoggedIn = localStorage.getItem("isLoggedIn") === "true"
      if (isLoggedIn) {
        const userData = localStorage.getItem("currentUser")
        if (userData) {
          setUser(JSON.parse(userData))
        }
      }
      setIsLoading(false)
    }

    // dummy blogs if none exist
    const initializeBlogs = () => {
      const blogs = localStorage.getItem("blogs")
      if (!blogs) {
        const dummyBlogs = [
          {
            id: "1",
            title: "Top Football Transfers of the Season",
            description: "A roundup of the biggest and most surprising football transfers this season.",
            image: "https://e0.365dm.com/23/06/2048x1152/skysports-premier-league-transfers_6185760.jpg?20230613083616",
            authorId: "system",
            createdAt: new Date().toISOString(),
          },
          {
            id: "2",
            title: "Cricket World Cup 2024: Key Takeaways",
            description: "Analyzing the standout moments and performances from the 2024 Cricket World Cup.",
            image: "https://thesportzplanet.com/wp-content/uploads/2024/04/WhatsApp-Image-2023-03-18-at-1.04.16-AM.jpeg",
            authorId: "system",
            createdAt: new Date(Date.now() - 86400000).toISOString(),
          },
          {
            id: "3",
            title: "Young Stars to Watch: Football & Cricket",
            description: "Meet the rising talents in both football and cricket set to dominate the next decade.",
            image: "https://res.cloudinary.com/jerrick/image/upload/d_642250b563292b35f27461a7.png,f_jpg,fl_progressive,q_auto,w_1024/642bbaa1c78bad001da8bcbc.jpg",
            authorId: "system",
            createdAt: new Date(Date.now() - 172800000).toISOString(),
          },
          {
            id: "4",
            title: "Cricket’s IPL vs Football’s UCL: Clash of Giants",
            description: "Comparing the scale, viewership, and global impact of the IPL and UEFA Champions League.",
            image: "https://assets.telegraphindia.com/telegraph/2022/May/1653733728_lead-1_-2-join.jpg",
            authorId: "system",
            createdAt: new Date(Date.now() - 259200000).toISOString(),
          },
          {
            id: "5",
            title: "Lewis Hamilton’s Road to F1 Greatness",
            description: "From humble beginnings to a record-equalling 7 world titles — a look at Hamilton's iconic career.",
            image: "https://media-cldnry.s-nbcnews.com/image/upload/t_fit-560w,f_auto,q_auto:best/rockcms/2024-02/240102-lewis-hamilton-mb-1209-65adb6.jpg",
            authorId: "system",
            createdAt: new Date(Date.now() - 345600000).toISOString(),
          },
        ]
        localStorage.setItem("blogs", JSON.stringify(dummyBlogs))
      }
    }

    if (typeof window !== "undefined") {
      checkAuth()
      initializeBlogs()
    }
  }, [])

  const login = async (email: string, password: string) => {
    try {
      const usersJson = localStorage.getItem("users")
      if (!usersJson) return false

      const users = JSON.parse(usersJson)
      const user = users.find((u: any) => u.email === email && u.password === password)

      if (user) {
        const { password, ...userWithoutPassword } = user
        localStorage.setItem("isLoggedIn", "true")
        localStorage.setItem("currentUser", JSON.stringify(userWithoutPassword))
        setUser(userWithoutPassword)
        return true
      }

      return false
    } catch (error) {
      console.error("Login error:", error)
      return false
    }
  }

  const signup = async (name: string, email: string, password: string) => {
    try {
      const usersJson = localStorage.getItem("users")
      const users = usersJson ? JSON.parse(usersJson) : []

      // Check if user already exists
      if (users.some((u: any) => u.email === email)) {
        return false
      }

      const newUser = {
        id: Date.now().toString(),
        name,
        email,
        password,
      }

      users.push(newUser)
      localStorage.setItem("users", JSON.stringify(users))
      return true
    } catch (error) {
      console.error("Signup error:", error)
      return false
    }
  }

  const logout = () => {
    localStorage.removeItem("isLoggedIn")
    localStorage.removeItem("currentUser")
    setUser(null)
    router.push("/login")
  }

  return <AuthContext.Provider value={{ user, isLoading, login, signup, logout }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

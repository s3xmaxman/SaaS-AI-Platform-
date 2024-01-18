"use client"

import { useState, useEffect } from "react"
import { Crisp } from "crisp-sdk-web"

export const CrispChat = () => {
    useEffect(() => {
        Crisp.configure("45c191d9-6410-4047-a32d-98eed3aec060")
    }, [])

    return null
}
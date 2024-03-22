"use client"

import { darkClassGenerator } from '@/utils/darkClassGenerator'
import React from 'react'
import { useSelector } from 'react-redux';

export default function DesktopFinalModal({ children }) {
    const isDark = useSelector((state) => state.theme.isDark);

    return (
        <div className={darkClassGenerator(isDark, "desktopFinalModal")}>
            <div className="modal__content">
                {children}
            </div>
        </div>
    )
}

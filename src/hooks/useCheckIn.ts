import { useState, useEffect, useCallback } from 'react'
import type { CheckIn, UserPoints } from '@/types/leader'
import { trackEvent } from '@/lib/analytics'

const CHECKINS_KEY = 'monkmode_checkins'
const POINTS_KEY = 'monkmode_points'

const POINTS_PER_CHECKIN = 10
const POINTS_PER_STREAK_BONUS = 5  // Extra points for each day in streak

/**
 * Hook for managing check-ins and gamification
 */
export function useCheckIn() {
    const [checkIns, setCheckIns] = useState<CheckIn[]>([])
    const [points, setPoints] = useState<UserPoints>({
        totalPoints: 0,
        checkIns: 0,
        currentStreak: 0,
        longestStreak: 0,
        badges: []
    })

    // Load from localStorage on mount
    useEffect(() => {
        const savedCheckIns = localStorage.getItem(CHECKINS_KEY)
        const savedPoints = localStorage.getItem(POINTS_KEY)

        if (savedCheckIns) {
            setCheckIns(JSON.parse(savedCheckIns))
        }
        if (savedPoints) {
            setPoints(JSON.parse(savedPoints))
        }
    }, [])

    // Save to localStorage when state changes
    useEffect(() => {
        localStorage.setItem(CHECKINS_KEY, JSON.stringify(checkIns))
    }, [checkIns])

    useEffect(() => {
        localStorage.setItem(POINTS_KEY, JSON.stringify(points))
    }, [points])

    /**
     * Calculate current streak based on check-ins
     */
    const calculateStreak = useCallback((allCheckIns: CheckIn[]): number => {
        if (allCheckIns.length === 0) return 0

        const sortedDates = [...new Set(
            allCheckIns.map(c => new Date(c.date).toDateString())
        )].sort((a, b) => new Date(b).getTime() - new Date(a).getTime())

        const today = new Date().toDateString()
        const yesterday = new Date(Date.now() - 86400000).toDateString()

        // Check if most recent check-in is today or yesterday
        if (sortedDates[0] !== today && sortedDates[0] !== yesterday) {
            return 0  // Streak broken
        }

        let streak = 1
        for (let i = 0; i < sortedDates.length - 1; i++) {
            const current = new Date(sortedDates[i])
            const next = new Date(sortedDates[i + 1])
            const diffDays = (current.getTime() - next.getTime()) / 86400000

            if (diffDays === 1) {
                streak++
            } else {
                break
            }
        }

        return streak
    }, [])

    /**
     * Check if user has already checked in today
     */
    const hasCheckedInToday = useCallback((): boolean => {
        const today = new Date().toDateString()
        return checkIns.some(c => new Date(c.date).toDateString() === today)
    }, [checkIns])

    /**
     * Perform a check-in
     */
    const doCheckIn = useCallback((nodeId: string | null = null, duration: number = 30) => {
        if (hasCheckedInToday()) {
            return { success: false, message: 'Bạn đã check-in hôm nay rồi!' }
        }

        const newCheckIn: CheckIn = {
            id: `checkin-${Date.now()}`,
            userId: 'current-user',  // Would come from auth
            nodeId,
            date: new Date(),
            type: nodeId ? 'node' : 'solo',
            duration
        }

        const updatedCheckIns = [newCheckIn, ...checkIns]
        setCheckIns(updatedCheckIns)

        // Calculate new streak
        const newStreak = calculateStreak(updatedCheckIns)

        // Calculate points earned
        const basePoints = POINTS_PER_CHECKIN
        const streakBonus = newStreak > 1 ? (newStreak - 1) * POINTS_PER_STREAK_BONUS : 0
        const nodeBonus = nodeId ? 5 : 0  // Extra points for practicing at a node
        const earnedPoints = basePoints + streakBonus + nodeBonus

        // Check for new badges
        const newBadges = [...points.badges]
        const totalCheckIns = points.checkIns + 1

        if (totalCheckIns >= 7 && !newBadges.includes('week-warrior')) {
            newBadges.push('week-warrior')
        }
        if (totalCheckIns >= 30 && !newBadges.includes('month-master')) {
            newBadges.push('month-master')
        }
        if (newStreak >= 7 && !newBadges.includes('streak-seven')) {
            newBadges.push('streak-seven')
        }
        if (newStreak >= 21 && !newBadges.includes('streak-twentyone')) {
            newBadges.push('streak-twentyone')
        }

        setPoints({
            totalPoints: points.totalPoints + earnedPoints,
            checkIns: totalCheckIns,
            currentStreak: newStreak,
            longestStreak: Math.max(newStreak, points.longestStreak),
            badges: newBadges
        })

        trackEvent('complete_checkin', { duration, streak: newStreak, type: newCheckIn.type })

        return {
            success: true,
            earnedPoints,
            newStreak,
            message: `+${earnedPoints} điểm! Chuỗi ${newStreak} ngày 🔥`
        }
    }, [checkIns, points, hasCheckedInToday, calculateStreak])

    /**
     * Get today's check-in if exists
     */
    const getTodayCheckIn = useCallback((): CheckIn | null => {
        const today = new Date().toDateString()
        return checkIns.find(c => new Date(c.date).toDateString() === today) || null
    }, [checkIns])

    return {
        checkIns,
        points,
        doCheckIn,
        hasCheckedInToday,
        getTodayCheckIn,
        calculateStreak
    }
}

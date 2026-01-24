import { useState, useEffect } from 'react'
import { MapPin, Clock, Users, Navigation, Award, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { mockNodes, formatDistance } from '@/data/mockNodes'
import type { PracticeNode } from '@/types/leader'
import { usePageMeta } from '@/lib/seo'
import { useTranslation } from 'react-i18next'

export function FindSangha() {
    const { t } = useTranslation()
    const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null)
    const [locationError, setLocationError] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(false)

    usePageMeta({
        title: t('findSangha.metaTitle'),
        description: t('findSangha.metaDescription')
    })

    // Default to HCMC center if no location
    const defaultLocation = { lat: 10.7769, lng: 106.6895 }

    const requestLocation = () => {
        setIsLoading(true)
        setLocationError(null)

        if (!navigator.geolocation) {
            setLocationError('Trình duyệt không hỗ trợ định vị GPS')
            setIsLoading(false)
            return
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                setUserLocation({
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                })
                setIsLoading(false)
            },
            (error) => {
                console.error('Geolocation error:', error)
                setLocationError('Không thể xác định vị trí. Vui lòng cho phép truy cập GPS.')
                setIsLoading(false)
            }
        )
    }

    // Request location on mount
    useEffect(() => {
        requestLocation()
    }, [])

    const location = userLocation || defaultLocation
    const activeNodes = mockNodes.filter(n => n.isActive)

    return (
        <div className="container mx-auto px-4 py-8 max-w-6xl">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-4xl font-bold text-foreground mb-2">
                    Tìm Sangha Gần Bạn
                </h1>
                <p className="text-muted-foreground">
                    "Thiền đường xanh" - Các điểm tập tại công viên
                </p>
            </div>

            {/* Location Status */}
            <div className="bg-card rounded-lg border border-border p-4 mb-6">
                <div className="flex items-center justify-between flex-wrap gap-4">
                    <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${userLocation ? 'bg-green-500/10' : 'bg-yellow-500/10'}`}>
                            <Navigation className={`h-5 w-5 ${userLocation ? 'text-green-500' : 'text-yellow-500'}`} />
                        </div>
                        <div>
                            <p className="font-medium text-foreground">
                                {userLocation ? 'Đã xác định vị trí' : 'Vị trí mặc định: TP.HCM'}
                            </p>
                            <p className="text-xs text-muted-foreground">
                                {userLocation
                                    ? `${userLocation.lat.toFixed(4)}, ${userLocation.lng.toFixed(4)}`
                                    : 'Cho phép GPS để xem khoảng cách chính xác'
                                }
                            </p>
                        </div>
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={requestLocation}
                        disabled={isLoading}
                    >
                        {isLoading ? 'Đang xác định...' : 'Cập nhật vị trí'}
                    </Button>
                </div>

                {locationError && (
                    <div className="mt-3 flex items-center gap-2 text-sm text-yellow-600">
                        <AlertCircle className="h-4 w-4" />
                        {locationError}
                    </div>
                )}
            </div>

            {/* Practice Nodes Grid */}
            <div className="grid md:grid-cols-2 gap-4 mb-8">
                {activeNodes.map((node) => (
                    <NodeCard
                        key={node.id}
                        node={node}
                        userLat={location.lat}
                        userLng={location.lng}
                    />
                ))}
            </div>

            {/* Info Footer */}
            <div className="bg-muted rounded-lg p-6">
                <h3 className="font-semibold text-foreground mb-3">
                    Thời gian vàng để tập luyện
                </h3>
                <div className="flex items-center gap-3 text-muted-foreground">
                    <Clock className="h-5 w-5 text-primary" />
                    <div>
                        <p className="font-medium text-foreground">5:30 AM - 6:30 AM</p>
                        <p className="text-sm">
                            Giờ này công viên là của người dân tập thể dục, an ninh lỏng, năng lượng tốt.
                        </p>
                    </div>
                </div>
                <div className="mt-4 text-sm text-muted-foreground">
                    <p className="font-medium text-foreground mb-1">Kịch bản 60 phút (The Ritual):</p>
                    <ul className="space-y-1">
                        <li>• 0-10 phút: Khởi động (Qigong/Yoga nhẹ)</li>
                        <li>• 10-40 phút: Tọa thiền (Nghe file dẫn qua App)</li>
                        <li>• 40-50 phút: Thiền hành (Đi bộ chánh niệm)</li>
                        <li>• 50-60 phút: Chia sẻ nhanh & Giải tán</li>
                    </ul>
                </div>
            </div>
        </div>
    )
}

function NodeCard({
    node,
    userLat,
    userLng
}: {
    node: PracticeNode
    userLat: number
    userLng: number
}) {
    const distance = formatDistance(userLat, userLng, node.lat, node.lng)

    const badgeColors = {
        gold: 'bg-yellow-500/10 text-yellow-600',
        silver: 'bg-gray-400/10 text-gray-500',
        bronze: 'bg-orange-500/10 text-orange-600'
    }

    return (
        <div className="bg-card rounded-lg border border-border p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                    <h3 className="text-lg font-semibold text-foreground mb-1">
                        {node.name}
                    </h3>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        <span>{node.address}</span>
                    </div>
                </div>
                <div className="text-right">
                    <span className="text-sm font-medium text-primary">{distance}</span>
                </div>
            </div>

            <div className="flex items-center gap-4 mb-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>{node.schedule}</span>
                </div>
                <div className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    <span>{node.memberCount} thành viên</span>
                </div>
            </div>

            {node.leader && (
                <div className="flex items-center gap-2 mb-4">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium text-primary">
                            {node.leader.name.charAt(0)}
                        </div>
                        <div>
                            <p className="text-sm font-medium text-foreground">{node.leader.name}</p>
                            <div className="flex items-center gap-1">
                                {node.leader.isVerified && (
                                    <span className="text-xs text-green-600">✓ Verified</span>
                                )}
                                <span className={`text-xs px-2 py-0.5 rounded-full ${badgeColors[node.leader.badge]}`}>
                                    <Award className="h-3 w-3 inline mr-1" />
                                    {node.leader.badge}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <Button className="w-full" variant="outline">
                Xem chi tiết & Tham gia
            </Button>
        </div>
    )
}

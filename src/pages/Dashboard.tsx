import { useState } from 'react'
import { useAppState } from '@/hooks/useAppState'
import { useCheckIn } from '@/hooks/useCheckIn'
import { Button } from '@/components/ui/button'
import { Link } from 'react-router-dom'
import { Timer, MapPin, Flame, Clock, Zap, Award, CheckCircle2, Sparkles, Download } from 'lucide-react'

export function Dashboard() {
  const { getStats } = useAppState()
  const { points, doCheckIn, hasCheckedInToday, getTodayCheckIn } = useCheckIn()
  const stats = getStats()
  const [checkInMessage, setCheckInMessage] = useState<string | null>(null)

  const checkedInToday = hasCheckedInToday()
  const todayCheckIn = getTodayCheckIn()

  const handleCheckIn = () => {
    const result = doCheckIn(null, 30) // Solo check-in for 30 mins
    if (result.success) {
      setCheckInMessage(result.message || 'Check-in thành công!')
      setTimeout(() => setCheckInMessage(null), 3000)
    } else {
      setCheckInMessage(result.message || 'Đã check-in hôm nay')
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-foreground mb-2">
          Tỉnh Thức Mỗi Ngày
        </h1>
        <p className="text-muted-foreground">
          Stream Entry Community • Công nghệ vị nhân sinh
        </p>
      </div>

      {/* Check-in Hero Card */}
      <div className={`rounded-xl border-2 p-6 mb-8 ${checkedInToday
        ? 'bg-green-50 border-green-200 dark:bg-green-950/20 dark:border-green-900'
        : 'bg-primary/5 border-primary/20'
        }`}>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center ${checkedInToday ? 'bg-green-500' : 'bg-primary'
              }`}>
              {checkedInToday ? (
                <CheckCircle2 className="h-8 w-8 text-white" />
              ) : (
                <Sparkles className="h-8 w-8 text-primary-foreground" />
              )}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-foreground">
                {checkedInToday ? 'Đã Check-in Hôm Nay!' : 'Check-in Tu Tập'}
              </h2>
              <p className="text-muted-foreground">
                {checkedInToday
                  ? `${todayCheckIn?.duration || 30} phút thiền tập • Chuỗi ${points.currentStreak} ngày 🔥`
                  : 'Ghi nhận buổi thực hành hôm nay'
                }
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Points Display */}
            <div className="text-center px-4 py-2 bg-background rounded-lg border border-border">
              <div className="flex items-center gap-1 text-primary">
                <Zap className="h-4 w-4" />
                <span className="text-2xl font-bold">{points.totalPoints}</span>
              </div>
              <span className="text-xs text-muted-foreground">điểm</span>
            </div>

            {!checkedInToday && (
              <Button size="lg" onClick={handleCheckIn} className="gap-2">
                <CheckCircle2 className="h-5 w-5" />
                Check-in Ngay
              </Button>
            )}
          </div>
        </div>

        {checkInMessage && (
          <div className="mt-4 text-center text-primary font-medium animate-pulse">
            {checkInMessage}
          </div>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid md:grid-cols-4 gap-4 mb-8">
        <div className="bg-card rounded-lg border border-border p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Check-ins</span>
            <Timer className="h-4 w-4 text-primary" />
          </div>
          <div className="text-3xl font-bold text-foreground">{points.checkIns}</div>
        </div>

        <div className="bg-card rounded-lg border border-border p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Tổng thời gian</span>
            <Clock className="h-4 w-4 text-primary" />
          </div>
          <div className="text-3xl font-bold text-foreground">{stats.totalMinutes}</div>
          <div className="text-xs text-muted-foreground mt-1">phút</div>
        </div>

        <div className="bg-card rounded-lg border border-border p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Chuỗi hiện tại</span>
            <Flame className="h-4 w-4 text-destructive" />
          </div>
          <div className="text-3xl font-bold text-foreground">{points.currentStreak}</div>
          <div className="text-xs text-muted-foreground mt-1">ngày</div>
        </div>

        <div className="bg-card rounded-lg border border-border p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Huy hiệu</span>
            <Award className="h-4 w-4 text-primary" />
          </div>
          <div className="text-3xl font-bold text-foreground">{points.badges.length}</div>
          <div className="text-xs text-muted-foreground mt-1">đạt được</div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Quick Actions */}
        <div className="bg-card rounded-lg border border-border p-6">
          <h2 className="text-xl font-semibold text-foreground mb-4">Hành Động Nhanh</h2>
          <div className="space-y-3">
            <Link to="/tim-sangha">
              <Button className="w-full justify-start bg-primary text-primary-foreground" size="lg">
                <MapPin className="mr-2 h-5 w-5" />
                Tìm Sangha Gần Bạn
              </Button>
            </Link>
            <Link to="/thien-dinh">
              <Button className="w-full justify-start" variant="outline">
                <Timer className="mr-2 h-4 w-4" />
                Bắt đầu ngồi thiền
              </Button>
            </Link>
            <a href="/nhapluu-book.pdf" download="con-duong-nhap-luu.pdf">
              <Button className="w-full justify-start" variant="outline">
                <Download className="mr-2 h-4 w-4" />
                Tải sách Nhập Lưu (PDF)
              </Button>
            </a>
          </div>
        </div>

        {/* Recent Check-ins */}
        <div className="bg-card rounded-lg border border-border p-6">
          <h2 className="text-xl font-semibold text-foreground mb-4">Check-in Gần Đây</h2>
          {points.checkIns === 0 ? (
            <p className="text-muted-foreground text-sm">
              Chưa có check-in nào. Hãy check-in ngay hôm nay!
            </p>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between py-2 border-b border-border">
                <div className="flex items-center gap-2">
                  <Flame className="h-4 w-4 text-destructive" />
                  <span className="text-sm font-medium text-foreground">Chuỗi hiện tại</span>
                </div>
                <span className="text-sm font-bold text-primary">{points.currentStreak} ngày</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-border">
                <div className="flex items-center gap-2">
                  <Award className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium text-foreground">Chuỗi dài nhất</span>
                </div>
                <span className="text-sm font-bold text-primary">{points.longestStreak} ngày</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-yellow-500" />
                  <span className="text-sm font-medium text-foreground">Tổng check-in</span>
                </div>
                <span className="text-sm font-bold text-primary">{points.checkIns} buổi</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Stream-entry Summary (Nhập Dòng Giải Thoát) */}
      <div className="mt-12 bg-card rounded-lg border border-border p-6">
        <h2 className="text-xl font-semibold text-foreground mb-3">
          Nhập Dòng Giải Thoát (Sotāpatti)
        </h2>
        <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
          Cửa vào Thánh đạo bắt đầu khi ba kiết sử (thân kiến, nghi, giới cấm thủ) được đoạn trừ nhờ
          chánh kiến trực chứng duyên khởi và Tứ Thánh Đế. Dòng chảy: Thiện hữu + Nghe Pháp →
          Như lý tác ý → Giới thanh tịnh → Hộ trì căn → Chánh niệm tỉnh giác → Đoạn triền cái →
          Định → Tuệ quán vô thường-khổ-vô ngã → Pháp nhãn khai mở.
        </p>
        <div className="grid md:grid-cols-2 gap-4 mb-4">
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-foreground">Bốn yếu tố chuẩn bị</h3>
            <ul className="text-xs text-muted-foreground list-disc pl-5 space-y-1">
              <li>Thiện hữu (SN 55.1)</li>
              <li>Nghe Diệu Pháp (MN 95, MN 47)</li>
              <li>Như lý tác ý (MN 2)</li>
              <li>Hành pháp & tùy pháp (MN 27, DN 2)</li>
            </ul>
          </div>
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-foreground">Các trụ cột tu tập</h3>
            <ul className="text-xs text-muted-foreground list-disc pl-5 space-y-1">
              <li>Năm căn → năm lực (SN 48.10)</li>
              <li>Bảy giác chi quân bình (SN 46.14, MN 118)</li>
              <li>Quán duyên khởi & vô thường (SN 12.2, SN 12.15, SN 12.23)</li>
              <li>Giới & đời sống phạm hạnh thực chứng (DN 2, DN 31)</li>
            </ul>
          </div>
        </div>
        <div className="space-y-2 mb-4">
          <h3 className="text-sm font-medium text-foreground">Dấu hiệu thành tựu (AN 10.92)</h3>
          <p className="text-xs text-muted-foreground">
            Niềm tin bất động nơi Phật–Pháp–Tăng, giới không đứt đoạn, không còn rơi ác thú, hướng chắc chắn đến giải thoát trong tối đa bảy đời.
          </p>
        </div>
        <p className="text-xs text-muted-foreground">
          Tham khảo tổng hợp khái luận bên ngoài:{" "}
          <a
            href="https://budsas.net/dlpp/bai203/index.htm"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary underline"
          >
            budsas.net • Bài 203
          </a>{" "}
          (liên kết ngoài – không lưu trữ nguyên văn để tôn trọng bản quyền dịch giả).
        </p>
      </div>

      {/* Daily Quote */}
      <div className="mt-8 bg-muted rounded-lg p-6 text-center">
        <blockquote className="text-lg italic text-foreground font-serif mb-2">
          "Appamādo amatapadaṃ"
        </blockquote>
        <p className="text-muted-foreground text-sm">
          Không phóng dật là con đường đến bất tử
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          — Pháp Cú 21
        </p>
      </div>
    </div>
  )
}

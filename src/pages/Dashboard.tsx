import { useAppState } from '@/hooks/useAppState'
import { Button } from '@/components/ui/button'
import { Link } from 'react-router-dom'
import { Timer, BookOpen, Trophy, Flame, Clock } from 'lucide-react'

export function Dashboard() {
  const { state, getStats } = useAppState()
  const stats = getStats()

  const hasStartedProgram = state.programProgress !== null
  const recentSessions = state.meditationSessions.slice(0, 5)

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-foreground mb-2">
          Chào mừng trở lại
        </h1>
        <p className="text-muted-foreground">
          Hôm nay là ngày tốt lành để tu tập chánh niệm
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid md:grid-cols-4 gap-4 mb-8">
        <div className="bg-card rounded-lg border border-border p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Tổng số buổi</span>
            <Timer className="h-4 w-4 text-primary" />
          </div>
          <div className="text-3xl font-bold text-foreground">{stats.totalMeditations}</div>
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
          <div className="text-3xl font-bold text-foreground">{stats.currentStreak}</div>
          <div className="text-xs text-muted-foreground mt-1">ngày</div>
        </div>

        <div className="bg-card rounded-lg border border-border p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Tiến độ 90 ngày</span>
            <Trophy className="h-4 w-4 text-primary" />
          </div>
          <div className="text-3xl font-bold text-foreground">{stats.programDaysCompleted}</div>
          <div className="text-xs text-muted-foreground mt-1">/ 90 ngày</div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Quick Actions */}
        <div className="bg-card rounded-lg border border-border p-6">
          <h2 className="text-xl font-semibold text-foreground mb-4">Hành Động Nhanh</h2>
          <div className="space-y-3">
            <Link to="/thien-dinh">
              <Button className="w-full justify-start" variant="outline">
                <Timer className="mr-2 h-4 w-4" />
                Bắt đầu ngồi thiền
              </Button>
            </Link>
            <Link to="/kinh-tang">
              <Button className="w-full justify-start" variant="outline">
                <BookOpen className="mr-2 h-4 w-4" />
                Đọc kinh một bài
              </Button>
            </Link>
            {!hasStartedProgram && (
              <Link to="/chuong-trinh">
                <Button className="w-full justify-start bg-primary text-primary-foreground">
                  <Trophy className="mr-2 h-4 w-4" />
                  Bắt đầu chương trình 90 ngày
                </Button>
              </Link>
            )}
          </div>
        </div>

        {/* Recent Sessions */}
        <div className="bg-card rounded-lg border border-border p-6">
          <h2 className="text-xl font-semibold text-foreground mb-4">Buổi Thiền Gần Đây</h2>
          {recentSessions.length === 0 ? (
            <p className="text-muted-foreground text-sm">
              Chưa có buổi thiền nào. Hãy bắt đầu ngay hôm nay!
            </p>
          ) : (
            <div className="space-y-3">
              {recentSessions.map((session) => (
                <div key={session.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                  <div>
                    <div className="text-sm font-medium text-foreground">
                      {session.type === 'anapanasati' ? 'Niệm hơi thở' :
                       session.type === 'vipassana' ? 'Vipassanā' :
                       session.type === 'walking' ? 'Thiền đi' : 'Khác'}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(session.date).toLocaleDateString('vi-VN')}
                    </div>
                  </div>
                  <div className="text-sm font-semibold text-primary">
                    {session.duration} phút
                  </div>
                </div>
              ))}
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

import { useAppState } from '@/hooks/useAppState'
import { Button } from '@/components/ui/button'
import { Trophy, CheckCircle2, Circle, Calendar, Download, BookOpen } from 'lucide-react'

export function Program() {
  const { state, startProgram, markDayComplete } = useAppState()
  const hasStarted = state.programProgress !== null

  const weeklyGoals = [
    {
      week: '1-2',
      title: 'Nền Tảng',
      tasks: [
        'Giữ trọn 5 giới mỗi ngày',
        'Thiền 10 phút/ngày',
        'Đọc 1 bài kinh mỗi tối'
      ]
    },
    {
      week: '3-6',
      title: 'Làm Sâu',
      tasks: [
        'Tiếp tục 5 giới',
        'Thiền 2 buổi x 25 phút/ngày',
        'Tích hợp thiền đi'
      ]
    },
    {
      week: '7-10',
      title: 'Tăng Cường',
      tasks: [
        'Một ngày "mini retreat" mỗi tuần',
        '8 giờ im lặng cao quý',
        'Tắt điện thoại khi tu tập',
        'Tập trung Tứ Niệm Xứ'
      ]
    },
    {
      week: '11-12',
      title: 'Đột Phá',
      tasks: [
        'Tham gia khóa tu 7-10 ngày',
        'Tu tập chuyên sâu với sự hướng dẫn',
        'Tích hợp và xác minh'
      ]
    }
  ]

  const handleStartProgram = () => {
    if (confirm('Bạn đã sẵn sàng cam kết với chương trình 90 ngày?')) {
      startProgram()
    }
  }

  const handleMarkToday = () => {
    const today = new Date().toISOString().split('T')[0]
    markDayComplete(today)
  }

  const isTodayCompleted = state.programProgress?.completedDays.includes(
    new Date().toISOString().split('T')[0]
  )

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-foreground mb-2">
          Chương Trình 90 Ngày Nhập Lưu
        </h1>
        <p className="text-muted-foreground">
          Con đường có cấu trúc dẫn đến quả vị Dự Lưu (Sotāpanna)
        </p>
      </div>

      {!hasStarted ? (
        // Program Introduction
        <div className="space-y-6">
          <div className="bg-card rounded-lg border border-border p-6">
            <h2 className="text-2xl font-semibold text-foreground mb-4">
              Giới Thiệu Chương Trình
            </h2>
            <div className="prose prose-slate max-w-none text-foreground">
              <p>
                Chương trình 90 ngày này được thiết kế dựa trên bốn yếu tố cốt lõi dẫn đến Dự Lưu:
              </p>
              <ul className="space-y-2">
                <li><strong>Thiện tri thức</strong> (Kalyāṇamittā): Cộng đồng và hướng dẫn</li>
                <li><strong>Nghe Chánh Pháp</strong> (Saddhamma-savana): Tiếp cận giáo lý đích thực</li>
                <li><strong>Như lý tác ý</strong> (Yoniso-manasikāra): Nuôi dưỡng tâm đúng đắn</li>
                <li><strong>Pháp tùy pháp hành</strong> (Dhammānudhamma-paṭipatti): Thực hành đúng Pháp</li>
              </ul>

              <h3 className="text-xl font-semibold mt-6 mb-3">Ba Trụ Cột: Giới - Định - Tuệ</h3>
              <p>
                <strong>Giới (Sīla):</strong> Nền tảng vững chắc. Giữ trọn 5 giới hàng ngày, thêm 8 giới vào ngày Uposatha.
              </p>
              <p>
                <strong>Định (Samādhi):</strong> Xây dựng sức mạnh tâm. Tối thiểu 30-40 phút x 2 buổi/ngày,
                ưu tiên Niệm hơi thở (Ānāpānasati).
              </p>
              <p>
                <strong>Tuệ (Paññā):</strong> Cắt đứt ba xiềng xích. Quán tam tướng: vô thường, khổ, vô ngã
                qua Tứ Niệm Xứ.
              </p>
            </div>
          </div>

          {/* Weekly Structure */}
          <div className="grid md:grid-cols-2 gap-4">
            {weeklyGoals.map((period) => (
              <div key={period.week} className="bg-card rounded-lg border border-border p-6">
                <div className="flex items-center gap-2 mb-3">
                  <Trophy className="h-5 w-5 text-primary" />
                  <h3 className="font-semibold text-foreground">
                    Tuần {period.week}: {period.title}
                  </h3>
                </div>
                <ul className="space-y-2">
                  {period.tasks.map((task, i) => (
                    <li key={i} className="text-sm text-muted-foreground flex items-start">
                      <span className="mr-2">•</span>
                      <span>{task}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Download Book Section */}
          <div className="bg-card rounded-lg border border-border p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <BookOpen className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  Sách Hướng Dẫn Chi Tiết
                </h3>
                <p className="text-muted-foreground mb-4">
                  Tải xuống sách "Con Đường Nhập Lưu" - Hướng dẫn đầy đủ về chương trình 90 ngày 
                  với các phương pháp thiền định, kinh điển cần đọc, và lộ trình tu tập chi tiết.
                </p>
                <a
                  href="/nhapluu-book.pdf"
                  download="con-duong-nhap-luu.pdf"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
                >
                  <Download className="h-4 w-4" />
                  Tải Sách PDF (Miễn Phí)
                </a>
              </div>
            </div>
          </div>

          <div className="bg-muted rounded-lg p-6 text-center">
            <h3 className="text-xl font-semibold text-foreground mb-3">
              Sẵn sàng bắt đầu?
            </h3>
            <p className="text-muted-foreground mb-4">
              Cam kết 90 ngày tu tập đều đặn để tạo điều kiện tối ưu cho việc chứng ngộ
            </p>
            <Button onClick={handleStartProgram} className="bg-primary text-primary-foreground">
              <Trophy className="mr-2 h-4 w-4" />
              Bắt Đầu Chương Trình
            </Button>
          </div>
        </div>
      ) : (
        // Program Progress
        <div className="space-y-6">
          {/* Progress Overview */}
          <div className="bg-card rounded-lg border border-border p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-semibold text-foreground">
                Tiến Độ Của Bạn
              </h2>
              <div className="text-right">
                <div className="text-3xl font-bold text-primary">
                  {state.programProgress?.completedDays.length || 0}
                </div>
                <div className="text-sm text-muted-foreground">/ 90 ngày</div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mb-4">
              <div className="h-4 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary transition-all duration-300"
                  style={{
                    width: `${((state.programProgress?.completedDays.length || 0) / 90) * 100}%`
                  }}
                />
              </div>
            </div>

            {/* Current Week */}
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-muted-foreground">Tuần hiện tại</div>
                <div className="text-lg font-semibold text-foreground">
                  Tuần {state.programProgress?.currentWeek || 1}
                </div>
              </div>
              <Button
                onClick={handleMarkToday}
                disabled={isTodayCompleted}
                className={isTodayCompleted ? 'bg-muted text-muted-foreground' : 'bg-primary text-primary-foreground'}
              >
                {isTodayCompleted ? (
                  <>
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Hôm nay đã hoàn thành
                  </>
                ) : (
                  <>
                    <Calendar className="mr-2 h-4 w-4" />
                    Đánh dấu hôm nay
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Weekly Goals */}
          <div className="bg-card rounded-lg border border-border p-6">
            <h3 className="text-xl font-semibold text-foreground mb-4">
              Mục Tiêu Giai Đoạn
            </h3>
            <div className="space-y-4">
              {weeklyGoals.map((period, index) => {
                const weekNum = index + 1
                const currentWeek = state.programProgress?.currentWeek || 1
                const isActive =
                  (weekNum === 1 && currentWeek <= 2) ||
                  (weekNum === 2 && currentWeek >= 3 && currentWeek <= 6) ||
                  (weekNum === 3 && currentWeek >= 7 && currentWeek <= 10) ||
                  (weekNum === 4 && currentWeek >= 11)

                return (
                  <div
                    key={period.week}
                    className={`p-4 rounded-lg border ${
                      isActive
                        ? 'border-primary bg-primary/5'
                        : 'border-border bg-muted/30'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      {isActive ? (
                        <CheckCircle2 className="h-5 w-5 text-primary" />
                      ) : (
                        <Circle className="h-5 w-5 text-muted-foreground" />
                      )}
                      <h4 className="font-semibold text-foreground">
                        Tuần {period.week}: {period.title}
                      </h4>
                    </div>
                    <ul className="space-y-1 ml-7">
                      {period.tasks.map((task, i) => (
                        <li key={i} className="text-sm text-muted-foreground">
                          • {task}
                        </li>
                      ))}
                    </ul>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Calendar View (Last 7 days) */}
          <div className="bg-card rounded-lg border border-border p-6">
            <h3 className="text-xl font-semibold text-foreground mb-4">
              7 Ngày Gần Đây
            </h3>
            <div className="grid grid-cols-7 gap-2">
              {Array.from({ length: 7 }).map((_, i) => {
                const date = new Date()
                date.setDate(date.getDate() - (6 - i))
                const dateStr = date.toISOString().split('T')[0]
                const isCompleted = state.programProgress?.completedDays.includes(dateStr)

                return (
                  <div key={i} className="text-center">
                    <div className="text-xs text-muted-foreground mb-1">
                      {date.toLocaleDateString('vi-VN', { weekday: 'short' })}
                    </div>
                    <div
                      className={`
                        aspect-square rounded-md flex items-center justify-center border
                        ${isCompleted
                          ? 'bg-primary border-primary text-primary-foreground'
                          : 'border-border bg-muted'
                        }
                      `}
                    >
                      {isCompleted && <CheckCircle2 className="h-4 w-4" />}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {date.getDate()}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

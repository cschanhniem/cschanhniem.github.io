import { Users, MessageCircle, Calendar, BookOpen, Heart, ExternalLink } from 'lucide-react'

export function Community() {
  const resources = [
    {
      title: 'Discord - Cộng Đồng Nhập Lưu',
      description: 'Tham gia Discord để thảo luận, chia sẻ kinh nghiệm tu tập và nhận hỗ trợ từ cộng đồng',
      icon: MessageCircle,
      link: 'https://discord.gg/FWgScmadrg',
      isExternal: true
    },
    {
      title: 'Nhóm Thiền Online',
      description: 'Các buổi ngồi thiền chung trực tuyến cùng cộng đồng (sắp ra mắt)',
      icon: Users,
      link: '#'
    },
    {
      title: 'Lịch Sự Kiện',
      description: 'Các khóa tu, pháp thoại và hoạt động Phật giáo (sắp ra mắt)',
      icon: Calendar,
      link: '#'
    },
    {
      title: 'Thư Viện Pháp Âm',
      description: 'Nghe pháp thoại từ các thiền sư uy tín (sắp ra mắt)',
      icon: BookOpen,
      link: '#'
    }
  ]

  const teachers = [
    {
      name: 'Mahasi Sayadaw',
      tradition: 'Miến Điện (Burma)',
      description: 'Thiền Vipassanā truyền thống, phương pháp ghi nhận rõ ràng'
    },
    {
      name: 'Pa-Auk Sayadaw',
      tradition: 'Miến Điện',
      description: 'Kết hợp Samatha và Vipassanā, theo đúng Vi Diệu Pháp'
    },
    {
      name: 'Ajahn Chah',
      tradition: 'Rừng Thái (Thai Forest)',
      description: 'Thiền định đơn giản, sống theo giới luật nghiêm ngặt'
    },
    {
      name: 'Ajahn Brahm',
      tradition: 'Rừng Thái',
      description: 'Pháp thoại dễ hiểu, thiền Jhāna và tâm từ bi'
    },
    {
      name: 'S.N. Goenka',
      tradition: 'Vipassanā',
      description: 'Khóa tu 10 ngày Vipassanā, phổ biến toàn cầu'
    },
    {
      name: 'Bhikkhu Bodhi',
      tradition: 'Học Giả',
      description: 'Dịch thuật kinh điển Pāli, giảng giải sâu sắc'
    }
  ]

  const retreatCenters = [
    {
      name: 'Thiền Viện Mahasi (Myanmar)',
      location: 'Yangon, Myanmar',
      type: 'Vipassanā'
    },
    {
      name: 'Pa-Auk Forest Monastery',
      location: 'Myanmar',
      type: 'Samatha-Vipassanā'
    },
    {
      name: 'Wat Pah Nanachat',
      location: 'Thailand',
      type: 'Thai Forest'
    },
    {
      name: 'Vipassana Meditation Center',
      location: 'Nhiều địa điểm',
      type: 'Goenka 10 ngày'
    }
  ]

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-foreground mb-2">
          Cộng Đồng Tu Tập
        </h1>
        <p className="text-muted-foreground">
          Kalyāṇamitta 4.0 - Thiện tri thức trong thời đại số
        </p>
      </div>

      {/* Join Discord CTA */}
      <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg border border-primary/20 p-6 mb-8">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-foreground mb-2">
              Tham Gia Cộng Đồng Discord
            </h2>
            <p className="text-muted-foreground mb-4">
              Kết nối với đạo hữu, chia sẻ kinh nghiệm tu tập, hỏi đáp về Pháp và nhận hỗ trợ từ cộng đồng Nhập Lưu
            </p>
            <ul className="text-sm text-muted-foreground space-y-1 mb-4">
              <li>✓ Thảo luận kinh điển và pháp tu</li>
              <li>✓ Chia sẻ kinh nghiệm thiền định</li>
              <li>✓ Nhóm học Pāli cơ bản</li>
              <li>✓ Hỗ trợ kỹ thuật và góp ý phát triển</li>
            </ul>
            <a
              href="https://discord.gg/FWgScmadrg"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium"
            >
              <MessageCircle className="h-5 w-5" />
              Tham Gia Discord
              <ExternalLink className="h-4 w-4" />
            </a>
          </div>
          <div className="text-6xl">🧘</div>
        </div>
      </div>

      {/* Resources Grid */}
      <div className="grid md:grid-cols-2 gap-4 mb-8">
        {resources.map((resource) => {
          const Icon = resource.icon
          const content = (
            <div className="flex items-start gap-4">
              <div className="p-3 bg-primary/10 rounded-lg">
                <Icon className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    {resource.title}
                  </h3>
                  {resource.isExternal && <ExternalLink className="h-4 w-4 text-primary" />}
                </div>
                <p className="text-sm text-muted-foreground">
                  {resource.description}
                </p>
              </div>
            </div>
          )

          if (resource.isExternal) {
            return (
              <a
                key={resource.title}
                href={resource.link}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-card rounded-lg border border-border p-6 hover:shadow-md transition-shadow block"
              >
                {content}
              </a>
            )
          }

          return (
            <div
              key={resource.title}
              className="bg-card rounded-lg border border-border p-6 hover:shadow-md transition-shadow cursor-not-allowed opacity-60"
            >
              {content}
            </div>
          )
        })}
      </div>

      {/* Teachers Section */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-foreground mb-4">
          Thiền Sư & Truyền Thống
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {teachers.map((teacher) => (
            <div
              key={teacher.name}
              className="bg-card rounded-lg border border-border p-4"
            >
              <h3 className="font-semibold text-foreground mb-1">
                {teacher.name}
              </h3>
              <div className="text-sm text-primary mb-2">
                {teacher.tradition}
              </div>
              <p className="text-sm text-muted-foreground">
                {teacher.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Retreat Centers */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-foreground mb-4">
          Trung Tâm Tu Thiền
        </h2>
        <div className="bg-card rounded-lg border border-border p-6">
          <div className="space-y-4">
            {retreatCenters.map((center) => (
              <div
                key={center.name}
                className="flex items-start justify-between py-3 border-b border-border last:border-0"
              >
                <div>
                  <h3 className="font-semibold text-foreground mb-1">
                    {center.name}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {center.location}
                  </p>
                </div>
                <span className="px-3 py-1 bg-muted text-muted-foreground text-xs rounded-full">
                  {center.type}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Guidelines */}
      <div className="bg-muted rounded-lg p-6">
        <div className="flex items-start gap-3">
          <Heart className="h-5 w-5 text-primary flex-shrink-0 mt-1" />
          <div>
            <h3 className="font-semibold text-foreground mb-2">
              Nguyên Tắc Cộng Đồng
            </h3>
            <div className="text-sm text-muted-foreground space-y-1">
              <p>• Chánh ngữ (Right Speech): Nói lời chân thật, có ích, đúng thời</p>
              <p>• Tôn trọng tất cả truyền thống Phật giáo chân chánh</p>
              <p>• Chia sẻ kinh nghiệm tu tập, không khoe khoang chứng đạt</p>
              <p>• Hướng dẫn trực tiếp về thiền định nên được thực hiện bởi thiền sư có kinh nghiệm</p>
              <p>• Luôn xác minh với thiền sư trước khi tuyên bố chứng quả</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

import { Shield, Ban, DollarSign, Sparkles, Heart, Scale, Volume2, Users, Phone } from 'lucide-react'
import { usePageMeta } from '@/lib/seo'
import { useTranslation } from 'react-i18next'

export function CodeOfConduct() {
    const { t } = useTranslation()
    usePageMeta({
        title: t('codeOfConduct.metaTitle'),
        description: t('codeOfConduct.metaDescription')
    })
    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            {/* Header */}
            <div className="text-center mb-12">
                <h1 className="text-4xl font-bold text-foreground mb-3">
                    Hiến Chương Thành Viên
                </h1>
                <p className="text-lg text-muted-foreground">
                    Cộng Đồng Nhập Lưu - Stream Entry
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                    Phiên bản 1.0
                </p>
            </div>

            {/* Definition */}
            <div className="bg-card rounded-lg border border-border p-6 mb-8">
                <h2 className="text-xl font-semibold text-foreground mb-4">
                    I. Định Danh Cộng Đồng
                </h2>
                <p className="text-muted-foreground mb-4 leading-relaxed">
                    Chúng tôi là những người thực hành lối sống <strong className="text-foreground">Tỉnh thức (Mindfulness)</strong> và
                    <strong className="text-foreground"> Kỷ luật (Stream Entry)</strong> dựa trên nền tảng khoa học não bộ và triết lý Phật giáo nguyên thủy.
                </p>
                <div className="grid md:grid-cols-2 gap-4">
                    <div className="flex items-start gap-3">
                        <Heart className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                        <div>
                            <h3 className="font-medium text-foreground">Mục tiêu</h3>
                            <p className="text-sm text-muted-foreground">
                                Rèn luyện sức khỏe tinh thần, nâng cao khả năng tập trung và cân bằng cuộc sống
                            </p>
                        </div>
                    </div>
                    <div className="flex items-start gap-3">
                        <Scale className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                        <div>
                            <h3 className="font-medium text-foreground">Tính chất</h3>
                            <p className="text-sm text-muted-foreground">
                                Phi chính trị, Phi lợi nhuận tại điểm tập, Tuân thủ tuyệt đối pháp luật Việt Nam
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* 3 NOs - Core Rules */}
            <div className="mb-8">
                <h2 className="text-2xl font-bold text-foreground mb-2 text-center">
                    II. 3 Nguyên Tắc "Bất Khả Xâm Phạm"
                </h2>
                <p className="text-center text-muted-foreground mb-6">THE 3 NOs</p>

                <div className="space-y-4">
                    {/* NO 1 */}
                    <div className="bg-destructive/5 border border-destructive/20 rounded-lg p-6">
                        <div className="flex items-start gap-4">
                            <div className="p-3 bg-destructive/10 rounded-full">
                                <Ban className="h-6 w-6 text-destructive" />
                            </div>
                            <div className="flex-1">
                                <h3 className="text-lg font-semibold text-foreground mb-2">
                                    1. KHÔNG bàn luận Chính trị - Tôn giáo cực đoan
                                </h3>
                                <ul className="text-sm text-muted-foreground space-y-1">
                                    <li>• Chỉ tập trung vào kỹ thuật thiền, hơi thở và chuyển hóa nội tâm</li>
                                    <li>• Không tranh luận đúng/sai về các giáo phái khác</li>
                                    <li>• Không lợi dụng buổi tập để tuyên truyền tư tưởng chính trị</li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    {/* NO 2 */}
                    <div className="bg-destructive/5 border border-destructive/20 rounded-lg p-6">
                        <div className="flex items-start gap-4">
                            <div className="p-3 bg-destructive/10 rounded-full">
                                <DollarSign className="h-6 w-6 text-destructive" />
                            </div>
                            <div className="flex-1">
                                <h3 className="text-lg font-semibold text-foreground mb-2">
                                    2. KHÔNG giao dịch Tiền mặt - Chèo kéo thương mại
                                </h3>
                                <ul className="text-sm text-muted-foreground space-y-1">
                                    <li>• Tại điểm tập (công viên), tuyệt đối không quyên góp, vay mượn, bán hàng đa cấp</li>
                                    <li>• Không rủ rê đầu tư tài chính</li>
                                    <li>• Mọi hoạt động ủng hộ đều thực hiện minh bạch qua App/Tài khoản chính danh</li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    {/* NO 3 */}
                    <div className="bg-destructive/5 border border-destructive/20 rounded-lg p-6">
                        <div className="flex items-start gap-4">
                            <div className="p-3 bg-destructive/10 rounded-full">
                                <Sparkles className="h-6 w-6 text-destructive" />
                            </div>
                            <div className="flex-1">
                                <h3 className="text-lg font-semibold text-foreground mb-2">
                                    3. KHÔNG mê tín dị đoan - Thần thánh hóa
                                </h3>
                                <ul className="text-sm text-muted-foreground space-y-1">
                                    <li>• Không truyền bá năng lực siêu nhiên, chữa bệnh bằng phép lạ</li>
                                    <li>• Không các hình thức mê tín dị đoan trái pháp luật</li>
                                    <li>• Chúng tôi xem thiền là phương pháp rèn luyện tâm trí, không phải phép thuật</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Park Etiquette */}
            <div className="bg-card rounded-lg border border-border p-6 mb-8">
                <h2 className="text-xl font-semibold text-foreground mb-4">
                    III. Quy Tắc Ứng Xử Tại Công Cộng
                </h2>
                <p className="text-sm text-muted-foreground mb-4">
                    PARK ETIQUETTE - Hình ảnh của mỗi thành viên đại diện cho toàn bộ cộng đồng Stream Entry
                </p>

                <div className="space-y-4">
                    <div className="flex items-start gap-3">
                        <Users className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                        <div>
                            <h3 className="font-medium text-foreground">"Đến nhẹ nhàng - Đi sạch sẽ" (Leave No Trace)</h3>
                            <p className="text-sm text-muted-foreground">
                                Không xả rác. Tự dọn dẹp khu vực ngồi. Không tranh giành chỗ với người dân tập thể dục khác. Luôn nhường nhịn và mỉm cười.
                            </p>
                        </div>
                    </div>

                    <div className="flex items-start gap-3">
                        <Volume2 className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                        <div>
                            <h3 className="font-medium text-foreground">Kỷ luật Âm thanh (Silent Mode)</h3>
                            <p className="text-sm text-muted-foreground">
                                Giữ im lặng tuyệt đối trong giờ thiền. Sử dụng tai nghe cá nhân hoặc loa chung âm lượng nhỏ. Điện thoại để chế độ rung/tắt chuông.
                            </p>
                        </div>
                    </div>

                    <div className="flex items-start gap-3">
                        <Phone className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                        <div>
                            <h3 className="font-medium text-foreground">Ứng xử với Cơ quan chức năng</h3>
                            <p className="text-sm text-muted-foreground">
                                Giữ thái độ <strong>hợp tác, tôn trọng, bình tĩnh</strong>. Trình bày: "Chúng tôi là nhóm bạn rèn luyện sức khỏe, tập hít thở giảm stress".
                                Chấp hành ngay lập tức nếu được yêu cầu di chuyển.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Discipline */}
            <div className="bg-card rounded-lg border border-border p-6 mb-8">
                <h2 className="text-xl font-semibold text-foreground mb-4">
                    IV. Cơ Chế Bảo Vệ & Kỷ Luật
                </h2>
                <div className="flex items-start gap-3">
                    <Shield className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                    <div>
                        <p className="text-sm text-muted-foreground mb-3">
                            Thành viên khuyến khích mặc áo đồng phục hoặc đeo huy hiệu Stream Entry để dễ nhận diện và hỗ trợ nhau.
                        </p>
                        <p className="text-sm text-muted-foreground mb-2">
                            <strong className="text-foreground">Kỷ luật:</strong> Bất kỳ thành viên nào vi phạm 3 Nguyên tắc "Bất khả xâm phạm" sẽ bị:
                        </p>
                        <ol className="text-sm text-muted-foreground list-decimal pl-5 space-y-1">
                            <li>Mời ra khỏi buổi tập ngay lập tức</li>
                            <li>Khóa tài khoản vĩnh viễn trên App Nhập Lưu</li>
                            <li>Cộng đồng từ chối chịu trách nhiệm pháp lý cho các hành vi cá nhân sai phạm</li>
                        </ol>
                    </div>
                </div>
            </div>

            {/* Mantra */}
            <div className="bg-primary/5 border border-primary/20 rounded-lg p-8 text-center">
                <h2 className="text-xl font-semibold text-foreground mb-4">
                    V. Lời Tuyên Thệ (MANTRA)
                </h2>
                <blockquote className="text-lg italic text-foreground font-serif space-y-2">
                    <p>"Tôi đến đây để tìm sự bình yên, không phải sự ồn ào.</p>
                    <p>Tôi rèn luyện cho chính mình, và tôn trọng không gian của người khác.</p>
                    <p className="text-primary font-semibold">Tôi là một Stream Entry Practitioner - Tỉnh thức, Kỷ luật, Tử tế."</p>
                </blockquote>
            </div>
        </div>
    )
}

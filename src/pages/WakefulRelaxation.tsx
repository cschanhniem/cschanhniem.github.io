import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { ArrowRight, ArrowLeft, Wind, Activity, Brain, Heart, PlayCircle, PauseCircle, SkipForward } from 'lucide-react'
import { Link } from 'react-router-dom'

export function WakefulRelaxation() {
    const [activeStep, setActiveStep] = useState(0)
    const [isPlaying, setIsPlaying] = useState(false)

    const steps = [
        {
            title: 'Thiết lập Tư thế & "Cột trụ"',
            icon: Activity,
            content: [
                'Ngồi kiết già hoặc bán già. Nếu ngồi ghế, hai chân chạm đất.',
                'Xương sống thẳng nhưng không cứng. Tưởng tượng đỉnh đầu được treo bởi một sợi dây vô hình lên trần nhà.',
                'Khẩu quyết: "Đầu đội trời, gối chạm đất". Lồng ngực mở, cơ hoành hoạt động tự do.'
            ],
            insight: 'Tạo ra một cấu trúc vật lý vững chãi để cơ bắp không phải gồng gánh.'
        },
        {
            title: 'Quét & Thả lỏng Cơ vân',
            icon: Wind,
            content: [
                'Quét từ đỉnh đầu xuống vùng trán và giữa hai lông mày.',
                'Thả lỏng hàm dưới, lưỡi chạm nhẹ nướu trên.',
                'Buông xuôi hai vai như không còn trọng lượng.',
                'Hai bàn tay đặt nhẹ lên đùi.'
            ],
            insight: 'Loại bỏ sự căng thẳng thô bên ngoài. Đừng ép cơ bắp, hãy "mời" nó buông thư.'
        },
        {
            title: 'Thả lỏng Sâu & Giãn nở Mạch máu',
            icon: Heart,
            content: [
                'Đưa sự chú ý vào bên trong cơ thể (nội tạng, mạch máu).',
                'Tưởng tượng sự căng thẳng như nắm tay đang siết chặt, giờ từ từ mở ra.',
                'Tìm kiếm cảm giác ấm áp hoặc tê nhẹ lan tỏa (dấu hiệu giãn mạch).',
                'Dùng tâm Từ (Metta) để xoa dịu những vùng còn căng thẳng.'
            ],
            insight: 'Đây là bước cốt lõi để kích hoạt hệ thần kinh đối giao cảm.'
        },
        {
            title: 'Duy trì Tỉnh thức',
            icon: Brain,
            content: [
                'Neo tâm nhẹ nhàng vào cửa mũi hoặc vùng bụng.',
                'Hình dung tâm trí như ngọn đèn dầu trong lồng kính: Cơ thể tĩnh lặng (lồng kính), Tâm trí sáng rõ (ngọn đèn).',
                'Duy trì sự "Nhiệt tâm" (năng lượng tỉnh táo) để không rơi vào hôn trầm.'
            ],
            insight: 'Giao điểm giữa Định (thư giãn) và Tuệ (tỉnh thức).'
        },
        {
            title: 'Cân bằng & Kết thúc',
            icon: PlayCircle,
            content: [
                'Nếu buồn ngủ: Hít sâu, tập trung vào ánh sáng.',
                'Nếu suy nghĩ lung tung: Thở ra dài, tập trung vào cảm giác nặng của cơ thể.',
                'Kết thúc buổi tập nhẹ nhàng, giữ sự thư giãn khi quay lại hoạt động thường ngày.'
            ],
            insight: 'Thời gian lý tưởng: 15-20 phút mỗi ngày.'
        }
    ]

    const handleNext = () => {
        if (activeStep < steps.length - 1) setActiveStep(activeStep + 1)
    }

    const handlePrev = () => {
        if (activeStep > 0) setActiveStep(activeStep - 1)
    }

    const CurrentIcon = steps[activeStep].icon

    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            <div className="mb-8 flex items-center gap-2 text-sm text-muted-foreground">
                <Link to="/thien-dinh" className="hover:text-primary transition-colors">Thiền Định</Link>
                <span>/</span>
                <span className="text-foreground font-medium">Thư Giãn Trong Tỉnh Thức</span>
            </div>

            <div className="text-center mb-12">
                <h1 className="text-4xl font-bold text-foreground mb-4">
                    Thư Giãn Trong Tỉnh Thức
                </h1>
                <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                    Wakeful Relaxation • Đạt được trạng thái cân bằng nội môi, nơi cơ thể thư giãn sâu nhưng tâm trí vẫn sắc bén.
                </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
                {/* Navigation/Progress */}
                <div className="md:col-span-1 space-y-2">
                    {steps.map((step, index) => (
                        <div
                            key={index}
                            onClick={() => setActiveStep(index)}
                            className={`
                flex items-center gap-3 p-4 rounded-lg cursor-pointer transition-all border
                ${activeStep === index
                                    ? 'bg-primary/10 border-primary shadow-sm'
                                    : 'bg-card border-border hover:bg-muted'
                                }
              `}
                        >
                            <div className={`p-2 rounded-full ${activeStep === index ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                                <step.icon className="h-4 w-4" />
                            </div>
                            <div className="text-sm font-medium">
                                <span className="mr-2 opacity-50">0{index + 1}</span>
                                {step.title}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Step Content */}
                <div className="md:col-span-2">
                    <Card className="h-full p-8 flex flex-col justify-between border-2">
                        <div>
                            <div className="flex items-center gap-4 mb-6">
                                <div className="p-3 bg-primary/10 rounded-xl">
                                    <CurrentIcon className="h-8 w-8 text-primary" />
                                </div>
                                <h2 className="text-2xl font-bold text-foreground">
                                    {steps[activeStep].title}
                                </h2>
                            </div>

                            <div className="space-y-4 mb-8">
                                {steps[activeStep].content.map((text, idx) => (
                                    <div key={idx} className="flex gap-3">
                                        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-muted flex items-center justify-center text-xs font-medium text-muted-foreground mt-0.5">
                                            {idx + 1}
                                        </span>
                                        <p className="text-foreground leading-relaxed">{text}</p>
                                    </div>
                                ))}
                            </div>

                            <div className="bg-muted/50 rounded-lg p-4 border border-border">
                                <p className="text-sm italic text-muted-foreground">
                                    <span className="font-semibold text-primary not-italic mr-2">💡 Insight:</span>
                                    {steps[activeStep].insight}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center justify-between mt-8 pt-8 border-t border-border">
                            <Button
                                variant="ghost"
                                onClick={handlePrev}
                                disabled={activeStep === 0}
                                className="gap-2"
                            >
                                <ArrowLeft className="h-4 w-4" /> TRƯỚC
                            </Button>

                            <Button
                                onClick={handleNext}
                                disabled={activeStep === steps.length - 1}
                                className="gap-2"
                            >
                                TIẾP THEO <ArrowRight className="h-4 w-4" />
                            </Button>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    )
}

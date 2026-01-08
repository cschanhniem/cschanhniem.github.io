import { useState } from 'react'
import { useAppState } from '@/hooks/useAppState'
import { MeditationTimer } from '@/components/practice/MeditationTimer'
import { MeditationLogger } from '@/components/practice/MeditationLogger'
import { Timer, BookText, CheckSquare, BrainCircuit, ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'

export function Practice() {
  const { state, addMeditationSession, deleteMeditationSession, addPreceptsRecord } = useAppState()
  const [activeTab, setActiveTab] = useState<'timer' | 'log' | 'precepts' | 'guide'>('timer')

  const [preceptsType, setPreceptsType] = useState<'five' | 'eight'>('five')
  const [precepts, setPrecepts] = useState<{ [key: number]: boolean }>({})

  const fivePrecepts = [
    'Không sát sinh (Pāṇātipātā veramaṇī)',
    'Không trộm cắp (Adinnādānā veramaṇī)',
    'Không tà dâm (Kāmesumicchācāra veramaṇī)',
    'Không nói dối (Musāvādā veramaṇī)',
    'Không uống rượu, chất say (Surāmerayamajjapamādaṭṭhānā veramaṇī)'
  ]

  const eightPrecepts = [
    ...fivePrecepts.slice(0, 3),
    'Không nói dối (Musāvādā veramaṇī)',
    'Không uống rượu, chất say (Surāmerayamajjapamādaṭṭhānā veramaṇī)',
    'Không ăn phi thời (Vikālabhojanā veramaṇī)',
    'Không ca hát, múa, nhạc, trang sức (Nacca-gīta-vādita-visūkadassanā veramaṇī)',
    'Không ngồi nằm giường cao, sang trọng (Uccāsayana-mahāsayanā veramaṇī)'
  ]

  const currentPrecepts = preceptsType === 'five' ? fivePrecepts : eightPrecepts

  const handleTimerComplete = (duration: number) => {
    addMeditationSession({
      date: new Date().toISOString(),
      duration,
      type: 'anapanasati',
      quality: 3
    })
  }

  const handleSavePrecepts = () => {
    addPreceptsRecord({
      date: new Date().toISOString(),
      type: preceptsType,
      precepts
    })
    setPrecepts({})
    alert('Đã lưu ghi nhận giữ giới!')
  }

  const tabs = [
    { id: 'timer', name: 'Đồng Hồ Thiền', icon: Timer },
    { id: 'log', name: 'Ghi Nhận', icon: BookText },
    { id: 'precepts', name: 'Giữ Giới', icon: CheckSquare },
    { id: 'guide', name: 'Hướng Dẫn', icon: BrainCircuit }
  ]

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-foreground mb-2">
          Thiền Định & Giữ Giới
        </h1>
        <p className="text-muted-foreground">
          Giới - Định - Tuệ: Ba trụ cột của con đường giải thoát
        </p>
      </div>

      {/* Tabs */}
      <div className="border-b border-border mb-6">
        <div className="flex space-x-1 overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`
                  flex items-center space-x-2 px-4 py-3 border-b-2 font-medium text-sm transition-colors whitespace-nowrap
                  ${activeTab === tab.id
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground hover:border-muted'
                  }
                `}
              >
                <Icon className="h-4 w-4" />
                <span>{tab.name}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Tab Content */}
      <div className="grid md:grid-cols-2 gap-6">
        {activeTab === 'timer' && (
          <div className="md:col-span-2">
            <MeditationTimer onComplete={handleTimerComplete} />
          </div>
        )}

        {activeTab === 'log' && (
          <div className="md:col-span-2">
            <MeditationLogger
              onAdd={addMeditationSession}
              sessions={state.meditationSessions}
              onDelete={deleteMeditationSession}
            />
          </div>
        )}

        {activeTab === 'precepts' && (
          <div className="md:col-span-2">
            <div className="bg-card rounded-lg border border-border p-6 space-y-6">
              <div>
                <h3 className="text-xl font-semibold text-foreground mb-2">Ghi Nhận Giữ Giới</h3>
                <p className="text-sm text-muted-foreground">
                  Giới đức là nền tảng của tất cả công đức. Hãy kiểm tra và ghi nhận việc giữ giới hôm nay.
                </p>
              </div>

              {/* Type Selector */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Loại giới
                </label>
                <div className="flex gap-3">
                  <button
                    onClick={() => setPreceptsType('five')}
                    className={`
                      flex-1 py-3 px-4 rounded-md font-medium transition-colors
                      ${preceptsType === 'five'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground hover:bg-muted/80'
                      }
                    `}
                  >
                    5 Giới (Hằng Ngày)
                  </button>
                  <button
                    onClick={() => setPreceptsType('eight')}
                    className={`
                      flex-1 py-3 px-4 rounded-md font-medium transition-colors
                      ${preceptsType === 'eight'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground hover:bg-muted/80'
                      }
                    `}
                  >
                    8 Giới (Ngày Bố Tát)
                  </button>
                </div>
              </div>

              {/* Precepts Checklist */}
              <div className="space-y-3">
                {currentPrecepts.map((precept, index) => (
                  <label key={index} className="flex items-start space-x-3 p-3 bg-muted rounded-md cursor-pointer hover:bg-muted/80">
                    <input
                      type="checkbox"
                      checked={precepts[index + 1] || false}
                      onChange={(e) => setPrecepts({ ...precepts, [index + 1]: e.target.checked })}
                      className="mt-1 h-4 w-4 rounded border-input text-primary focus:ring-ring"
                    />
                    <div className="flex-1">
                      <div className="text-sm font-medium text-foreground">
                        {index + 1}. {precept.split('(')[0].trim()}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {precept.match(/\((.*?)\)/)?.[1]}
                      </div>
                    </div>
                  </label>
                ))}
              </div>

              <button
                onClick={handleSavePrecepts}
                className="w-full py-3 bg-primary text-primary-foreground rounded-md font-medium hover:bg-primary/90"
              >
                Lưu Ghi Nhận Giữ Giới
              </button>

              {/* Recent Records */}
              <div className="border-t border-border pt-6">
                <h4 className="font-semibold text-foreground mb-3">Lịch Sử Gần Đây</h4>
                {state.preceptsRecords.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Chưa có ghi nhận nào.</p>
                ) : (
                  <div className="space-y-2">
                    {state.preceptsRecords.slice(0, 5).map((record) => (
                      <div key={record.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                        <div>
                          <div className="text-sm font-medium text-foreground">
                            {record.type === 'five' ? '5 Giới' : '8 Giới'}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {new Date(record.date).toLocaleDateString('vi-VN')}
                          </div>
                        </div>
                        <div className="text-sm text-primary font-medium">
                          {Object.values(record.precepts).filter(Boolean).length}/{record.type === 'five' ? 5 : 8} giới
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'guide' && (
          <div className="md:col-span-2 space-y-4">
            <Link to="/thien-dinh/thu-gian" className="block">
              <div className="bg-card hover:bg-muted/50 transition-colors border border-border rounded-xl p-6 flex flex-col md:flex-row items-center gap-6 group">
                <div className="p-4 bg-primary/10 rounded-full flex-shrink-0 group-hover:bg-primary/20 transition-colors">
                  <BrainCircuit className="h-8 w-8 text-primary" />
                </div>
                <div className="flex-1 text-center md:text-left">
                  <h3 className="text-xl font-bold text-foreground mb-2">Thư Giãn Trong Tỉnh Thức</h3>
                  <p className="text-muted-foreground mb-4 md:mb-0">
                    Wakeful Relaxation - Kỹ thuật cân bằng hệ thần kinh, giúp cơ thể thư giãn sâu nhưng tâm trí vẫn sắc bén. Bước chuẩn bị quan trọng cho Thiền Định.
                  </p>
                </div>
                <Button className="flex-shrink-0" variant="outline">
                  Bắt đầu tập <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}

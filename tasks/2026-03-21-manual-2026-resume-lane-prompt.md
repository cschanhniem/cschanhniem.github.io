# Manual 2026 Resume Lane Prompt

## Why

Lane dịch `Nhập Lưu 2026` đã dài, nhiều batch, nhiều quy luật editorial tích lũy dần. Prompt cũ đủ mạnh về chất lượng văn và hierarchy nguồn, nhưng chưa khóa chặt phần tiếp quản lane. Khi một agent mới vào giữa chừng, rủi ro lớn nhất không phải là viết dở. Rủi ro lớn nhất là viết đúng giọng nhưng sai route kế tiếp, quên cập nhật `worklog`, hoặc khép batch không đủ bốn mặt trận: file, task log, worklog, audit.

Vì vậy đợt này bổ sung một prompt riêng cho thao tác `resume lane`.

## Changes

- Thêm `Prompt 7: Resume Lane Prompt` vào `docs/manual-2026-agent-prompts.md`
- Thêm state machine riêng cho việc tiếp quản lane
- Thêm sequence diagram riêng cho luồng `worklog -> rules -> adjacent files -> batch -> task log -> audit -> next lock`
- Thêm data flow riêng cho việc khóa lane tiếp theo
- Nối rule ngắn vào `AGENTS.md`
- Nối rule ngắn vào `SKILL.md`

## New Operating Rule

Một agent mới không được tiếp tục lane manual 2026 bằng suy đoán từ audit hoặc từ số file đang có.

Điểm vào mặc định phải là:

1. `worklog-translate-2026.md`
2. `AGENTS.md`
3. `SKILL.md`
4. `docs/manual-2026-agent-prompts.md`
5. các file manual liền kề của block sắp làm

Một lane chỉ được coi là `resume-safe` khi cả bốn thứ cùng khớp:

- file dịch mới
- task log trong `tasks/`
- `worklog-translate-2026.md`
- audit sau batch

## Effect

Agent sau có thể tiếp tục công việc một cách tuần tự, có hệ thống, không bõ sót, và không phải dựng lại tiến độ từ lịch sử chat.

## Verification

- Không chạy `lint` hay `build`
- Thay đổi chỉ nằm ở tài liệu và tác nghiệp agent

# Task Log: Manual 2026 Agent Prompt Pack

Date: 2026-03-17

## Goal

Viết một bộ prompt chuẩn để các AI agent tiếp tục hoàn thiện lớp `Nhập Lưu 2026` với chất lượng biên tập cao, giữ nghĩa gốc, và biết cách dùng English, HT. Thích Thanh Từ, cùng nguồn local trong repo theo đúng vai trò.

## Deliverables

- Thêm tài liệu prompt pack tại `docs/manual-2026-agent-prompts.md`
- Nối tài liệu này vào `AGENTS.md`
- Nối tài liệu này vào `SKILL.md`

## Editorial Decisions

- English giữ vai trò khóa nghĩa chính.
- HT. Thích Thanh Từ được định nghĩa là nguồn học về giọng, nhịp, độ sáng, và năng lực sư phạm của tiếng Việt, nhưng không được phép ghi đè nghĩa gốc.
- HT. Thích Minh Châu vẫn phải được giữ trong quy trình như một điểm tựa thuật ngữ và route-level cross-check, vì đây là nguồn local đang hiện diện trong sản phẩm.
- Nếu bản Thanh Từ chưa có thật trong workspace, agent phải khai báo rõ thay vì giả vờ đã dùng.

## Notes

- Đây là tài liệu vận hành, không làm thay công việc dịch.
- Prompt pack có thêm state machine, sequence diagram, và data flow để agent mới vào nắm đúng đường đi công việc thay vì chỉ bắt chước câu chữ.

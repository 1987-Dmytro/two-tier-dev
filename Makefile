# ci — чеки фич, которым не нужен claude: CI гоняет их на push сверх check-budget (SPEC-v3 §1).
ci:
	bin/check-budget --self-test

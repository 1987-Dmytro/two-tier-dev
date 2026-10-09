# ci — чеки фич, которым не нужен claude: CI гоняет их на push сверх check-budget (SPEC-v3 §1); bin/jev — без живого вызова (ключа в CI нет).
ci:
	bin/jev --self-test
	bin/check-spend --self-test
	bin/check-budget --self-test
	bin/check-budget --templates
	bin/check-harness --self-test
	bin/check-kit
	bin/check-docs

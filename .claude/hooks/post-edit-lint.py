#!/usr/bin/env python3
"""
Hook PostToolUse de Claude Code — corre después de cada Edit/Write.

Si el archivo tocado es .ts/.tsx, corre `eslint --fix` sobre ESE archivo
(rápido, acotado a uno solo — nada que ver con el `tsc` de todo el proyecto,
que se queda en el hook pre-push de Husky por ser más lento).

Si quedan errores que --fix no pudo resolver solo, se imprimen a stderr y el
script sale con código 2: eso hace que Claude Code le muestre el error de
vuelta al agente en el mismo turno, en vez de enterarse recién al correr
`npm run lint` manualmente más tarde.
"""

import json
import subprocess
import sys
from pathlib import Path

LINTABLE_SUFFIXES = (".ts", ".tsx")


def main() -> int:
    try:
        payload = json.load(sys.stdin)
    except json.JSONDecodeError:
        return 0

    tool_input = payload.get("tool_input", {})
    file_path = tool_input.get("file_path")
    cwd = payload.get("cwd", ".")

    if not file_path or not file_path.endswith(LINTABLE_SUFFIXES):
        return 0

    path = Path(file_path)
    if not path.is_absolute():
        path = Path(cwd) / path
    if not path.exists():
        return 0

    result = subprocess.run(
        ["npx", "eslint", "--fix", str(path)],
        cwd=cwd,
        capture_output=True,
        text=True,
    )

    if result.returncode != 0:
        sys.stderr.write(
            f"eslint encontró problemas en {path.name} que --fix no pudo resolver solo:\n\n"
            f"{result.stdout}{result.stderr}"
        )
        return 2

    return 0


if __name__ == "__main__":
    raise SystemExit(main())

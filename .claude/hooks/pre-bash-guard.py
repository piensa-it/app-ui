#!/usr/bin/env python3
"""
Hook PreToolUse de Claude Code — corre ANTES de cada comando de shell
(Bash o mcp__workspace__bash) y bloquea los que puedan descartar cambios sin
commitear sin que antes se haya verificado el estado del repo: git reset
--hard, git clean -f*, git checkout/restore de archivos, rm -rf dentro del
repo, y push --force.

No bloquea el uso normal de esos comandos (ej. `git checkout <rama>`,
`git reset <archivo>` para unstage, `git restore --staged`, `rm -rf` fuera
del repo) — solo los patrones específicamente destructivos.

Si un comando cae en la lista, sale con código 2: Claude Code cancela el
comando y le muestra el motivo al agente, que debe correr `git status`
(y `git stash -u` si hace falta) antes de decidir cómo seguir — la misma
regla que ya exige el system prompt, pero ahora mecánica en vez de depender
del criterio del agente en el momento.
"""

import json
import re
import sys

DANGEROUS_PATTERNS: list[tuple[re.Pattern[str], str]] = [
    (
        re.compile(r"\bgit\s+reset\b[^&|;]*--hard\b"),
        "`git reset --hard` descarta cambios sin commitear de forma irreversible.",
    ),
    (
        re.compile(r"\bgit\s+clean\b[^&|;]*-[a-zA-Z]*f"),
        "`git clean -f...` borra archivos no rastreados sin poder recuperarlos.",
    ),
    (
        re.compile(r"\bgit\s+checkout\s+(--\s+\S|\.\s*(&|;|\||$))"),
        "`git checkout -- <archivo>` / `git checkout .` descarta cambios locales sin commitear.",
    ),
    (
        re.compile(r"\bgit\s+restore\b(?!.*--staged)"),
        "`git restore` (sin --staged) descarta cambios del working tree sin commitear.",
    ),
    (
        re.compile(r"\brm\s+-[a-zA-Z]*r[a-zA-Z]*f[a-zA-Z]*\s+(?!/tmp\b|/sessions\b)\S"),
        "`rm -rf` dentro del repo es irreversible.",
    ),
    (
        re.compile(r"\bgit\s+push\b[^&|;]*(--force\b|-f\b)"),
        "`git push --force` puede sobrescribir/perder commits del remoto (de otros o tuyos).",
    ),
]


def main() -> int:
    try:
        payload = json.load(sys.stdin)
    except json.JSONDecodeError:
        return 0

    command = payload.get("tool_input", {}).get("command", "")
    if not command:
        return 0

    for pattern, reason in DANGEROUS_PATTERNS:
        if pattern.search(command):
            sys.stderr.write(
                f"Comando bloqueado por el hook de seguridad: {reason}\n\n"
                f"Comando: {command}\n\n"
                "Antes de continuar: corré `git status` (y `git stash -u` si hay algo que "
                "conservar), y si de verdad hace falta este comando, avisale al usuario o "
                "confirmá que no hay trabajo sin respaldar."
            )
            return 2

    return 0


if __name__ == "__main__":
    raise SystemExit(main())

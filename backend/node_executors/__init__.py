# ============================================
# Project: CIRCUIT - AI Workflow Orchestrator
# License: MIT
# ============================================

from .classify_node import execute as classify_execute
from .extract_node import execute as extract_execute
from .filter_node import execute as filter_execute
from .prompt_node import execute as prompt_execute
from .python_node import execute as python_execute
from .summarize_node import execute as summarize_execute
from .transform_node import execute as transform_execute
from .translate_node import execute as translate_execute

NODE_EXECUTORS = {
    "prompt": prompt_execute,
    "summarize": summarize_execute,
    "translate": translate_execute,
    "classify": classify_execute,
    "extract": extract_execute,
    "transform": transform_execute,
    "filter": filter_execute,
    "python": python_execute,
}

__all__ = ["NODE_EXECUTORS"]

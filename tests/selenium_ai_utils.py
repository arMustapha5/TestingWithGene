import os
import base64
import json
from PIL import Image, ImageChops
import numpy as np


def simple_visual_diff(img_a_path: str, img_b_path: str, diff_out_path: str) -> float:
    """
    Compute a naive visual difference score between two images and save a diff image.
    Returns a float [0..1] where 0 = identical.
    """
    a = Image.open(img_a_path).convert('RGB')
    b = Image.open(img_b_path).convert('RGB')
    if a.size != b.size:
        b = b.resize(a.size)
    diff = ImageChops.difference(a, b)
    arr = np.asarray(diff, dtype=np.int32)
    score = float(arr.sum()) / (255.0 * 3 * arr.shape[0] * arr.shape[1])
    diff.save(diff_out_path)
    return score


def ai_generate_test_cases(prompt: str) -> list:
    """
    Placeholder for AI-powered test case generation.
    In CI, you can replace this with a call to OpenAI/Azure/OpenRouter and parse returned cases.
    """
    base_cases = [
        "Biometric success",
        "Biometric failure -> fallback to password",
        "Face success",
        "Face failure -> fallback to password",
        "Lockout after 3 failures",
        "Permissions denied",
        "Network interruption",
    ]
    return base_cases



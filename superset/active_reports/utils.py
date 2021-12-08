def sort(data: any, col: str):
    return sorted(
        data, key=lambda d: d[col].lower() if isinstance(d[col], str) else "",
    )

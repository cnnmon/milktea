# process the input string
with open("backfill/data.txt", "r") as file:
    input_string = file.read()
    result = ""
    for section in input_string.split("☆"):
        if not section.strip():  # Skip empty sections
            continue
        
        # split the input into date, title, and content
        lines = section.split("\n", 1)
        first_line = lines[0].strip()
        content = lines[1].strip() if len(lines) > 1 else ""
        
        # extract the date and title from the first line
        if "--" in first_line:
            date, title = first_line.split("--", 1)
        else:
            date = first_line
            title = first_line

        content = content.replace("\n", "\\n\\n")
        content = content.replace('"', '\\"')
        title = title.strip().replace('"', '\\"')
        result += f'{{"title": "{title}", "content": "{content}", "tags": [], "date": "{date.strip()} 2024", "userId": "jx76xg2by0k0rm8y090npr2nbn784vrw"}}\n'
    
    print(result.rstrip())
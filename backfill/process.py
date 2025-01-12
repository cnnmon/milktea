"""
turn a string like:
"june 14 -- like a dream, i want to write it down so i wont forget\ni regret not taking more pictures, of being self conscious of how i looked, of avoiding selfies in fear of judgement\nnow that i'm older, i cherish any pictures i have of me and the people i love\ni have a hard time imagining how i'm perceived by others in the moment, and these photos --  depicting a self i no longer embody -- let me believe i was loved then, too\nthere are so many good things happening in my life that i wish my younger self knew of; i am capable of having great friends, an ideal relationship"

into:
example: {"title": "like a dream, i want to write it down so i wont forget", "content": "i regret not taking more pictures, of being self conscious of how i looked, of avoiding selfies in fear of judgement\nnow that i'm older, i cherish any pictures i have of me and the people i love\ni have a hard time imagining how i'm perceived by others in the moment, and these photos --  depicting a self i no longer embody -- let me believe i was loved then, too\nthere are so many good things happening in my life that i wish my younger self knew of; i am capable of having great friends, an ideal relationship", "tags": [], "createdAt": "june 14"}
"""

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
        result += f'{{"title": "{title}", "content": "{content}", "tags": [], "date": "{date.strip()} 2024"}}\n'
    
    print(result.rstrip())
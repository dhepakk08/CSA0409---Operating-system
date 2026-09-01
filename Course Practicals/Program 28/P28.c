#include <stdio.h>
#include <string.h>

int main()
{
    FILE *fp;
    char word[30], line[100];

    printf("Enter word to search: ");
    scanf("%s", word);

    fp = fopen("sample.txt", "r");

    if(fp == NULL)
    {
        printf("File not found\n");
        return 1;
    }

    printf("\nLines containing '%s':\n", word);

    while(fgets(line, sizeof(line), fp) != NULL)
    {
        if(strstr(line, word) != NULL)
        {
            printf("%s", line);
        }
    }

    fclose(fp);

    return 0;
}
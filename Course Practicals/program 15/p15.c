#include <stdio.h>

int main()
{
    int users, files, i, j;
    char username[10][30];
    char filename[10][10][30];

    printf("Enter number of users: ");
    scanf("%d", &users);

    for(i = 0; i < users; i++)
    {
        printf("\nEnter username: ");
        scanf("%s", username[i]);

        printf("Enter number of files: ");
        scanf("%d", &files);

        for(j = 0; j < files; j++)
        {
            printf("Enter file %d: ", j + 1);
            scanf("%s", filename[i][j]);
        }
    }

    printf("\nTwo Level Directory Structure\n");

    for(i = 0; i < users; i++)
    {
        printf("\nUser: %s\n", username[i]);

        for(j = 0; filename[i][j][0] != '\0'; j++)
        {
            printf("%s\n", filename[i][j]);
        }
    }

    return 0;
}
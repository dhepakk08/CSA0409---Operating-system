#include <stdio.h>
#include <stdlib.h>

int main()
{
    FILE *fp;

    // Create a file
    fp = fopen("sample.txt", "w");

    if(fp == NULL)
    {
        printf("File creation failed\n");
        return 1;
    }

    fprintf(fp, "Linux File Permission Example\n");
    fclose(fp);

    printf("\nFile created successfully\n");

    printf("\nInitial Permissions:\n");
    system("ls -l sample.txt");

    // Give read, write and execute permission to owner
    // Read and execute permission to group
    // Read permission to others
    system("chmod 754 sample.txt");

    printf("\nUpdated Permissions:\n");
    system("ls -l sample.txt");

    printf("\nUser Types:\n");
    printf("Owner  (u)  : Read, Write, Execute\n");
    printf("Group  (g)  : Read, Execute\n");
    printf("Others (o)  : Read\n");

    return 0;
}
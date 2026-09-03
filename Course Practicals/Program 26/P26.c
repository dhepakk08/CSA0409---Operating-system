#include <stdio.h>
#include <fcntl.h>
#include <unistd.h>

int main()
{
    int choice, fd, n;
    char data[100];

    printf("1. Create File\n");
    printf("2. Write File\n");
    printf("3. Read File\n");
    printf("4. Delete File\n");

    printf("Enter your choice: ");
    scanf("%d", &choice);

    if(choice == 1)
    {
        fd = open("sample.txt", O_CREAT | O_WRONLY, 0644);

        printf("File created successfully\n");

        close(fd);
    }

    else if(choice == 2)
    {
        fd = open("sample.txt", O_WRONLY | O_CREAT, 0644);

        printf("Enter text: ");
        scanf(" %[^\n]", data);

        write(fd, data, sizeof(data));

        close(fd);

        printf("Data written successfully\n");
    }

    else if(choice == 3)
    {
        fd = open("sample.txt", O_RDONLY);

        n = read(fd, data, sizeof(data));

        printf("File content: ");
        write(1, data, n);

        close(fd);
    }

    else if(choice == 4)
    {
        remove("sample.txt");

        printf("File deleted successfully\n");
    }

    else
    {
        printf("Invalid choice\n");
    }

    return 0;
}
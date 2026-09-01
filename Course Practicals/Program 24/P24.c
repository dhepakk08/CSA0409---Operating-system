#include <stdio.h>
#include <fcntl.h>
#include <unistd.h>

int main()
{
    int fd;
    char data[100];
    int n;

    fd = open("sample.txt", O_CREAT | O_RDWR, 0644);

    if(fd < 0)
    {
        printf("File cannot be opened\n");
        return 1;
    }

    printf("Enter text: ");
    scanf(" %[^\n]", data);

    write(fd, data, sizeof(data));

    lseek(fd, 0, SEEK_SET);

    n = read(fd, data, sizeof(data));

    printf("\nFile Content: ");
    write(1, data, n);

    close(fd);

    printf("\nFile closed successfully\n");

    return 0;
}
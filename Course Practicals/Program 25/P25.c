#include <stdio.h>
#include <fcntl.h>
#include <unistd.h>
#include <sys/stat.h>
#include <dirent.h>

int main()
{
    int fd;
    struct stat st;
    DIR *dir;
    struct dirent *entry;

    fd = open("sample.txt", O_CREAT | O_RDWR, 0644);

    if(fd < 0)
    {
        printf("File cannot be opened\n");
        return 1;
    }

    printf("File opened successfully\n");

    printf("File Descriptor: %d\n", fcntl(fd, F_GETFD));

    lseek(fd, 0, SEEK_END);
    printf("File pointer moved to end using lseek()\n");

    stat("sample.txt", &st);

    printf("File Size: %ld bytes\n", st.st_size);

    printf("\nDirectory Contents:\n");

    dir = opendir(".");

    while((entry = readdir(dir)) != NULL)
    {
        printf("%s\n", entry->d_name);
    }

    closedir(dir);
    close(fd);

    return 0;
}
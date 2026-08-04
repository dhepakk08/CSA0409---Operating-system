#include <stdio.h>
#include <string.h>
#include <sys/ipc.h>
#include <sys/msg.h>

struct message
{
    long type;
    char text[100];
};

int main()
{
    struct message msg;

    key_t key = 1234;

    int msgid = msgget(key, 0666 | IPC_CREAT);

    msg.type = 1;

    strcpy(msg.text, "Hello from Message Queue");

    msgsnd(msgid, &msg, sizeof(msg.text), 0);

    printf("Message Sent: %s\n", msg.text);

    msgrcv(msgid, &msg, sizeof(msg.text), 1, 0);

    printf("Message Received: %s\n", msg.text);

    msgctl(msgid, IPC_RMID, NULL);

    return 0;
}
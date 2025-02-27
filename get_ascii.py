import pygame, sys, math

pygame.init()
pygame.font.init()

font = pygame.font.Font('./fonts/dogica/TTF/dogicabold.ttf', 20)

ascii_chars = [' ', '.', '-', '+', '/',  'o', '%', '&', '#', '@']

resolution = (200, 20)
display = pygame.display.set_mode(resolution)

display.fill((0,0,0))
for i in range(len(ascii_chars)):
    display.blit(font.render(ascii_chars[i], False, (255,255,255)), (i*20, 0))

pygame.image.save(display, 'ascii.png')
while True:
    pygame.display.update()

    for event in pygame.event.get():
        if event.type == pygame.QUIT:
            pygame.quit()
            sys.exit()
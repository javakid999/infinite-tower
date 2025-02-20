import pygame, sys, math

pygame.init()
pygame.font.init()

font = pygame.font.Font('./fonts/dogica/TTF/dogicabold.ttf', 8)

ascii_chars = ['.', '-', '+', '/',  'o', '%', '&', '#', '@']

resolution = (720, 720)
display = pygame.display.set_mode(resolution)

mgirl = pygame.image.load('./test_images/mgirl.png')

def image_ascii(image, subd, color_depth):
    size = image.get_size()
    quantized_image = pygame.Surface(size)
    block_size = (math.floor(size[0]/subd), math.floor(size[1]/subd))

    for i in range(subd):
        for j in range(subd):
            color = image.get_at((block_size[0]*j,block_size[1]*i))
            q_color = [math.floor(c/(255/color_depth))*(255/color_depth) for c in color]
            h_color = [min(max(math.floor((color[i]*2 if q_color[i] != 0 else color[i]+150)/(255/color_depth))*(255/color_depth), 0), 255) for i in range(len(color))]
            color_avg = sum(color)/3
            q_color_avg = sum(q_color)/3
            h_color_avg = sum(h_color)/3
            if (h_color_avg == q_color_avg):
                q_x = 0
            else: 
                x = (color_avg - q_color_avg)/(h_color_avg - q_color_avg)
                q_x = max(min(math.floor(x * 10), 9), 0)
            pygame.draw.rect(quantized_image, q_color, (block_size[0]*j,block_size[1]*i, block_size[0], block_size[1]))
            if q_x != 0:
                char = font.render(ascii_chars[q_x-1], False, h_color)
                quantized_image.blit(pygame.transform.scale(char, block_size), (block_size[0]*j, block_size[1]*i))

    return quantized_image

q = image_ascii(mgirl, 100, 4)

display.fill((0,0,0))
display.blit(pygame.transform.scale(q, (720, 720)), (0,0))

#pygame.image.save(display, 'ascii.png')
while True:
    pygame.display.update()

    for event in pygame.event.get():
        if event.type == pygame.QUIT:
            pygame.quit()
            sys.exit()
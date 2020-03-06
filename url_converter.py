def convert_url():
    mens_urls = []
    womens_urls = []
    const_name = raw_input('What do you want to call this variable?')
    male_declaration = const_name + '_MENS' + ' = '
    female_declaration = const_name + '_WOMENS' + ' = '
    meet_name = raw_input('what is the name of this meet')
    while True:
        try:
            url = raw_input('Input url or done for done')
            if url == 'done':
                break
            converted_urls = male_female_url(url)
            mens_urls.append(converted_urls[0])
            womens_urls.append(converted_urls[1])
        except:
            print('please try again')
    print('export const ' + male_declaration + str(mens_urls) + ';')
    print('')
    print('export const ' + female_declaration + str(womens_urls) + ';')
    print('await insertToDatabase(await collectAthleteData(' + const_name + '_MENS, "' + meet_name + '"));')
    print('await insertToDatabase(await collectAthleteData(' + const_name + '_WOMENS, "' + meet_name + '"));')    
        
    

def male_female_url(url):
    split_url = url.split('/')[2:]
    male = split_url[:]
    female = split_url[:]
    male.insert(3, 'm')
    female.insert(3, 'f')
    male_ret = '/'.join(male)
    female_ret = '/'.join(female)
    return 'http://' + male_ret, 'http://' + female_ret

convert_url()